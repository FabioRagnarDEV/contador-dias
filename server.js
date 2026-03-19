const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const Joi = require('joi');
require('dotenv').config();

const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    store: new pgSession({
        pool: pgPool,
        tableName: 'session' 
    }),
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

const loginLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 5,
    handler: (req, res) => res.redirect('/login?erro=bloqueado'),
    standardHeaders: true,
    legacyHeaders: false,
});

const schemaCriarUsuario = Joi.object({
    novoUsuario: Joi.string().pattern(/^[a-zA-Z0-9._\-@]+$/).min(3).max(50).required(),
    novaSenha: Joi.string().min(6).max(100).required()
});

const schemaRastrear = Joi.object({
    pagina: Joi.string().max(255).required(),
    tempoSegundos: Joi.number().integer().min(0).required()
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

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/login', (req, res) => {
    if (req.session.logado) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/fazer-login', loginLimiter, async (req, res, next) => {
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
            if (!senhaCorreta) return res.redirect('/login?erro=senha');

            req.session.preAuthUser = userDB;
            return res.redirect('/login?step=2fa');
        }

        if (etapa === '2') {
            if (!req.session.preAuthUser) return res.redirect('/login');

            const userDB = req.session.preAuthUser;
            const verificado = speakeasy.totp.verify({
                secret: userDB.secret_2fa,
                encoding: 'base32',
                token: (token2fa || '').replace(/\s/g, ''), 
                window: 6 
            });

            if (verificado) {
                req.session.logado = true;
                req.session.usuarioNome = userDB.usuario;
                req.session.isAdmin = (userDB.role === 'admin'); 
                req.session.preAuthUser = null; 
                return res.redirect('/');
            } else {
                req.session.preAuthUser = null; 
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

app.post('/api/admin/criar-usuario', apenasAdmin, async (req, res, next) => {
    try {
        const { error, value } = schemaCriarUsuario.validate(req.body);
        if (error) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: error.details });

        const { novoUsuario, novaSenha } = value;

        const { data: existente } = await supabase.from('usuarios').select('*').eq('usuario', novoUsuario);
        if (existente && existente.length > 0) return res.status(400).json({ erro: 'Usuário já existe.' });

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        const secret = speakeasy.generateSecret({ 
            name: `Painel Prazos (${novoUsuario})`,
            issuer: "PainelPrazos"
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

app.get('/api/meus-dados', requireAuth, (req, res) => {
    res.json({ usuario: req.session.usuarioNome, isAdmin: req.session.isAdmin });
});

app.post('/api/rastrear', requireAuth, async (req, res, next) => {
    try {
        const { error, value } = schemaRastrear.validate(req.body);
        if (error) return res.status(400).json({ erro: 'Dados de rastreio inválidos.' });

        const { pagina, tempoSegundos } = value;
        
        let ip = req.ip;
        if (ip === '::1' || ip === '127.0.0.1') ip = '177.136.255.255'; 
        
        let localizacao = "Localização Desconhecida";
        try {
            const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
            const geoData = await geoResponse.json();
            if (geoData.status === 'success') {
                localizacao = `${geoData.city}, ${geoData.regionName} - ${geoData.country}`;
            }
        } catch (e) {}

        const dataHora = new Date().toLocaleString('pt-BR');
        const minutes = Math.floor(tempoSegundos / 60);
        const seconds = tempoSegundos % 60;
        const tempoFormatado = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        await supabase.from('acessos').insert([{ 
            data_hora: dataHora, ip: ip, localizacao: localizacao, pagina: pagina, tempo_uso: tempoFormatado 
        }]);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

app.get('/baixar-relatorio', requireAuth, async (req, res, next) => {
    try {
        const { data } = await supabase.from('acessos').select('*');
        let csv = 'Data,IP,Localizacao,Pagina,Tempo\n';
        if(data) {
            data.forEach(d => {
                const loc = d.localizacao ? d.localizacao.replace(/,/g, ' -') : '';
                csv += `"${d.data_hora}","${d.ip}","${loc}","${d.pagina}","${d.tempo_uso}"\n`;
            });
        }
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('Relatorio_Acessos.csv').send(csv);
    } catch (err) {
        next(err);
    }
});

app.use((req, res, next) => {
    if (req.session.logado) return next();
    res.redirect('/login');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.redirect('/'));

app.use((err, req, res, next) => {
    console.error('Erro interno detectado:', err.message); 
    
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
        res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
    } else {
        res.status(500).send('Erro interno do servidor.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));