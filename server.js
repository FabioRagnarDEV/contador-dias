const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
require('dotenv').config();

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. SEGURANÇA: Helmet
app.use(helmet({
    contentSecurityPolicy: false,
}));

// 2. SEGURANÇA: Rate Limit (20 minutos de bloqueio)
const loginLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 5,
    handler: (req, res) => res.redirect('/login?erro=bloqueado'),
    standardHeaders: true,
    legacyHeaders: false,
});

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. SEGURANÇA: Sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 86400000, // 24 horas
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
    }
}));

// --- MIDDLEWARE DE ADMINISTRAÇÃO ---
const apenasAdmin = (req, res, next) => {
    if (req.session.logado && req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ erro: 'Acesso Negado: Apenas administradores.' });
    }
};

// --- ROTAS PÚBLICAS ---

app.get('/login', (req, res) => {
    if (req.session.logado) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ROTA DE LOGIN (PRINCIPAL)
app.post('/fazer-login', loginLimiter, async (req, res) => {
    // Pegamos qual etapa estamos recebendo através de um input oculto
    const { etapa, usuario, senha, token2fa, 'cf-turnstile-response': tokenCaptcha } = req.body;

    // ==========================================
    // ETAPA 1: Validar Usuário, Senha e Captcha
    // ==========================================
    if (etapa === '1') {
        if (!tokenCaptcha) return res.redirect('/login?erro=captcha');
        
        try {
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
        } catch (error) {
            return res.redirect('/login?erro=captcha');
        }

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

        // SUCESSO NA ETAPA 1: Guarda o usuário numa sessão temporária
        req.session.preAuthUser = userDB;
        
        // Redireciona para o Front-End montar a Etapa 2
        return res.redirect('/login?step=2fa');
    }

    // ==========================================
    // ETAPA 2: Validar o Código Google Auth
    // ==========================================
    if (etapa === '2') {
        // Se alguém tentar forçar a URL direta sem passar pela etapa 1, barramos.
        if (!req.session.preAuthUser) return res.redirect('/login');

        const userDB = req.session.preAuthUser;
        const verificado = speakeasy.totp.verify({
            secret: userDB.secret_2fa,
            encoding: 'base32',
            token: token2fa.replace(/\s/g, ''), 
            window: 6 
        });

        if (verificado) {
            // LOGIN COMPLETO
            req.session.logado = true;
            req.session.usuarioNome = userDB.usuario;
            req.session.isAdmin = (userDB.role === 'admin'); 
            req.session.preAuthUser = null; // Limpa o rastro temporário
            
            return res.redirect('/');
        } else {
            // ERROU O 2FA:
            // Destrói a sessão temporária para obrigar a pessoa a colocar
            // usuário e senha de novo (Etapa 1), contando como falha no Rate Limit.
            req.session.preAuthUser = null; 
            return res.redirect('/login?erro=2fa');
        }
    }
    
    // Fallback de segurança se falhar a identificação da etapa
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// --- ROTAS DE ADMINISTRAÇÃO (NOVO) ---

// Endpoint para criar usuário via Modal
app.post('/api/admin/criar-usuario', apenasAdmin, async (req, res) => {
    const { novoUsuario, novaSenha } = req.body;

    if (!novoUsuario || !novaSenha) return res.status(400).json({ erro: 'Dados incompletos.' });

    try {
        // 1. Verifica duplicidade
        const { data: existente } = await supabase.from('usuarios').select('*').eq('usuario', novoUsuario);
        if (existente && existente.length > 0) return res.status(400).json({ erro: 'Usuário já existe.' });

        // 2. Criptografa Senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        // 3. Gera Segredo 2FA
        const secret = speakeasy.generateSecret({ 
            name: `Painel Prazos (${novoUsuario})`,
            issuer: "PainelPrazos"
        });

        // 4. Salva no Banco (Role padrão: 'user')
        const { error } = await supabase
            .from('usuarios')
            .insert([{ 
                usuario: novoUsuario, 
                senha_hash: senhaHash, 
                secret_2fa: secret.base32,
                role: 'user' 
            }]);

        if (error) throw error;

        // 5. Gera QR Code para enviar ao front
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        res.json({ 
            sucesso: true, 
            qrCode: qrCodeUrl, 
            secretText: secret.base32 
        });

    } catch (err) {
        console.error("Erro criação usuário:", err);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// Endpoint para front verificar permissões
app.get('/api/meus-dados', (req, res) => {
    if (!req.session.logado) return res.sendStatus(401);
    res.json({ 
        usuario: req.session.usuarioNome, 
        isAdmin: req.session.isAdmin 
    });
});

// --- ROTAS DE ANALYTICS E RELATÓRIOS ---

app.post('/api/rastrear', async (req, res) => {
    if (!req.session.logado) return res.sendStatus(401);
    const { pagina, tempoSegundos } = req.body;
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
});

app.get('/baixar-relatorio', async (req, res) => {
    if (!req.session.logado) return res.redirect('/login');
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
});

// --- GATEKEEPER (Middleware Global) ---
app.use((req, res, next) => {
    if (req.session.logado) return next();
    res.redirect('/login');
});

// Arquivos estáticos (Protegidos pelo Gatekeeper acima)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback
app.use((req, res) => res.redirect('/'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));