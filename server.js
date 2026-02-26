const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(helmet({
    contentSecurityPolicy: false,
}));


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

app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 86400000,
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
    }
}));

app.get('/login', (req, res) => {
    if (req.session.logado) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/fazer-login', loginLimiter, async (req, res) => {
    const { usuario, senha, 'cf-turnstile-response': tokenCaptcha } = req.body;

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

    if (usuario === process.env.MEU_USUARIO && senha === process.env.MINHA_SENHA) {
        req.session.logado = true;
        return res.redirect('/');
    }
    
    return res.redirect('/login?erro=senha');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// ... (Mantenha as rotas de API e Relatório iguais) ...
// API RASTREAR
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
    } catch (error) {}
    const dataHora = new Date().toLocaleString('pt-BR');
    const minutes = Math.floor(tempoSegundos / 60);
    const seconds = tempoSegundos % 60;
    const tempoFormatado = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    await supabase.from('acessos').insert([{ data_hora: dataHora, ip: ip, localizacao: localizacao, pagina: pagina, tempo_uso: tempoFormatado }]);
    res.sendStatus(200);
});

// ROTA RELATORIO
app.get('/baixar-relatorio', async (req, res) => {
    if (!req.session.logado) return res.redirect('/login');
    const { data, error } = await supabase.from('acessos').select('*');
    if (error) return res.status(500).send("Erro ao processar solicitação.");
    let csv = 'Data e Hora,Endereço IP,Localização,Página Acessada,Tempo de Uso\n';
    if (data) {
        data.forEach(item => {
            const loc = item.localizacao ? item.localizacao.replace(/,/g, ' -') : '';
            csv += `"${item.data_hora}","${item.ip}","${loc}","${item.pagina}","${item.tempo_uso}"\n`;
        });
    }
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('Relatorio_Acessos.csv');
    return res.send(csv);
});

app.use((req, res, next) => {
    if (req.session.logado) return next();
    res.redirect('/login');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});