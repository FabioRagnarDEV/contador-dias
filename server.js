const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const Joi = require('joi');
const hpp = require('hpp');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://challenges.cloudflare.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            frameSrc: ["'self'", "https://challenges.cloudflare.com"],
            connectSrc: ["'self'", "https://servicodados.ibge.gov.br", "https://challenges.cloudflare.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

app.use(session({
    store: new pgSession({ pool: pgPool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function logAuth(event, details = {}) {
    const entry = JSON.stringify({ timestamp: new Date().toISOString(), event, ...details }) + '\n';
    const file = path.join(LOGS_DIR, `auth-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(file, entry);
}

const failedLoginAttempts = new Map();

function registrarFalhaLogin(ip) {
    const agora = Date.now();
    const janela = 20 * 60 * 1000;
    const tentativas = (failedLoginAttempts.get(ip) || []).filter(t => agora - t < janela);
    tentativas.push(agora);
    failedLoginAttempts.set(ip, tentativas);
    return tentativas.length;
}

function limparFalhasAntigas() {
    const agora = Date.now();
    const janela = 20 * 60 * 1000;
    for (const [ip, tentativas] of failedLoginAttempts.entries()) {
        const recentes = tentativas.filter(t => agora - t < janela);
        if (recentes.length === 0) failedLoginAttempts.delete(ip);
        else failedLoginAttempts.set(ip, recentes);
    }
}
setInterval(limparFalhasAntigas, 5 * 60 * 1000);

const loginLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 5,
    handler: (req, res) => res.redirect('/login?erro=bloqueado'),
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use('/api/', apiLimiter);

const schemaCriarUsuario = Joi.object({
    novoUsuario: Joi.string().pattern(/^[a-zA-Z0-9._\-@]+$/).min(3).max(50).required(),
    novaSenha: Joi.string().min(6).max(100).required()
});

const apenasAdmin = (req, res, next) => {
    if (req.session.logado && req.session.isAdmin) return next();
    res.status(403).json({ erro: 'Acesso Negado.' });
};

const requireAuth = (req, res, next) => {
    if (req.session && req.session.logado) return next();
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
        return res.status(401).json({ error: 'Não autenticado.' });
    }
    res.redirect('/login');
};

function gerarCsrfToken(req) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    return req.session.csrfToken;
}

function verificarCsrf(req, res, next) {
    const tokenBody   = req.body?.csrfToken;
    const tokenHeader = req.headers['x-csrf-token'];
    const tokenSessao = req.session?.csrfToken;
    if (!tokenSessao || (tokenBody !== tokenSessao && tokenHeader !== tokenSessao)) {
        return res.status(403).json({ erro: 'Requisição inválida.' });
    }
    next();
}

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/login', (req, res) => {
    if (req.session.logado) return res.redirect('/');
    const csrfToken = gerarCsrfToken(req);
    let html = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf-8');
    html = html.replace('</form>', `<input type="hidden" name="csrfToken" value="${csrfToken}"></form>`);
    res.send(html);
});

app.post('/fazer-login', loginLimiter, verificarCsrf, async (req, res, next) => {
    try {
        const { etapa, usuario, senha, token2fa, 'cf-turnstile-response': tokenCaptcha } = req.body;

        if (etapa === '1') {
            if (!tokenCaptcha) return res.redirect('/login?erro=captcha');

            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET,
                    response: tokenCaptcha,
                    remoteip: req.ip
                })
            });
            const outcome = await response.json();
            if (!outcome.success) return res.redirect('/login?erro=captcha');

            const { data: users, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usuario', usuario)
                .limit(1);

            if (error || !users || users.length === 0) {
                await new Promise(r => setTimeout(r, 2000));
                return res.redirect('/login?erro=senha');
            }

            const userDB = users[0];
            const senhaCorreta = await bcrypt.compare(senha, userDB.senha_hash);
            if (!senhaCorreta) {
                const tentativas = registrarFalhaLogin(req.ip);
                logAuth('LOGIN_FALHOU', { usuario, tentativas });
                return res.redirect('/login?erro=senha');
            }

            req.session.preAuthUserId = userDB.id;
            return res.redirect('/login?step=2fa');
        }

        if (etapa === '2') {
            if (!req.session.preAuthUserId) return res.redirect('/login');

            const { data: users, error: fetchError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', req.session.preAuthUserId)
                .limit(1);

            if (fetchError || !users || users.length === 0) return res.redirect('/login');

            const userDB = users[0];
            const verificado = speakeasy.totp.verify({
                secret: userDB.secret_2fa,
                encoding: 'base32',
                token: (token2fa || '').replace(/\s/g, ''),
                window: 1
            });

            if (verificado) {
                req.session.logado = true;
                req.session.usuarioNome = userDB.usuario;
                req.session.isAdmin = (userDB.role === 'admin');
                req.session.preAuthUserId = null;
                logAuth('LOGIN_SUCESSO', { usuario: userDB.usuario });
                return res.redirect('/');
            } else {
                req.session.preAuthUserId = null;
                const tentativas = registrarFalhaLogin(req.ip);
                logAuth('2FA_FALHOU', { usuario: userDB.usuario, tentativas });
                return res.redirect('/login?erro=2fa');
            }
        }

        res.redirect('/login');
    } catch (err) {
        next(err);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

app.post('/api/admin/criar-usuario', apenasAdmin, verificarCsrf, async (req, res, next) => {
    try {
        const { error, value } = schemaCriarUsuario.validate(req.body);
        if (error) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: error.details });

        const { novoUsuario, novaSenha } = value;

        const { data: existente } = await supabase.from('usuarios').select('id').eq('usuario', novoUsuario);
        if (existente && existente.length > 0) return res.status(400).json({ erro: 'Usuário já existe.' });

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        const secret = speakeasy.generateSecret({
            name: `Painel Prazos (${novoUsuario})`,
            issuer: 'PainelPrazos'
        });

        const { error: insertError } = await supabase
            .from('usuarios')
            .insert([{
                usuario: novoUsuario,
                senha_hash: senhaHash,
                secret_2fa: secret.base32,
                role: 'user'
            }]);

        if (insertError) throw insertError;

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.json({ sucesso: true, qrCode: qrCodeUrl, secretText: secret.base32 });
    } catch (err) {
        next(err);
    }
});

app.post('/api/admin/resetar-usuario', apenasAdmin, verificarCsrf, async (req, res, next) => {
    const { usuarioTarget, novaSenha } = req.body;
    if (!usuarioTarget || !novaSenha) {
        return res.status(400).json({ erro: 'Usuário e nova senha são obrigatórios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

        const novoSecret = speakeasy.generateSecret({ name: `Painel Prazos (${usuarioTarget})` });
        const { error } = await supabase
            .from('usuarios')
            .update({ senha_hash: novaSenhaHash, secret_2fa: novoSecret.base32 })
            .eq('usuario', usuarioTarget);

        if (error) throw error;

        const qrCodeUrl = await qrcode.toDataURL(novoSecret.otpauth_url);
        res.json({ sucesso: true, mensagem: 'Usuário resetado com sucesso!', qrCode: qrCodeUrl });
    } catch (err) {
        next(err);
    }
});

app.get('/api/meus-dados', requireAuth, (req, res) => {
    const csrfToken = gerarCsrfToken(req);
    return res.json({ usuario: req.session.usuarioNome, isAdmin: req.session.isAdmin, csrfToken });
});

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use((req, res, next) => {
    if (req.session.logado) return next();
    res.redirect('/login');
});
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.redirect('/'));

app.use((err, req, res, next) => {
    logAuth('SERVER_ERROR', {
        route: `${req.method} ${req.originalUrl}`,
        message: err.message || 'Erro Desconhecido'
    });
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    } else {
        res.status(500).send('Erro interno do servidor. Volte à página inicial e tente novamente.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
