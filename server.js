const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// --- BIBLIOTECAS DE SEGURANÇA ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- CONFIGURAÇÃO DO SUPABASE ---
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Desativado para não bloquear scripts externos
}));


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    handler: (req, res) => {
        console.log(`⛔ Bloqueio de IP ativado para: ${req.ip}`);
        res.redirect('/login?erro=bloqueado');
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.set('trust proxy', 1); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração da Sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-secreta-temporaria', // Defina SESSION_SECRET no .env
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 1 dia
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' 
    }
}));

// --- ROTAS DE ACESSO ---

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota de Login com o Limitador de Segurança aplicado
app.post('/fazer-login', loginLimiter, (req, res) => {
    const { usuario, senha } = req.body;

    // Verifica credenciais do .env
    if (usuario === process.env.MEU_USUARIO && senha === process.env.MINHA_SENHA) {
        req.session.logado = true;
        console.log(`✅ Login Sucesso: ${req.ip}`);
        res.redirect('/');
    } else {
        console.log(`❌ Falha Login: ${req.ip}`);
        // O rateLimit já conta as falhas automaticamente. Apenas redirecionamos.
        res.redirect('/login?erro=senha'); 
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// --- SISTEMA DE ANALYTICS ---

app.post('/api/rastrear', async (req, res) => {
    if (!req.session.logado) return res.sendStatus(401);

    const { pagina, tempoSegundos } = req.body;
    let ip = req.ip;

    // Normalização de IP para testes locais (Remover em produção se desejar)
    if (ip === '::1' || ip === '127.0.0.1') ip = '177.136.255.255'; 

    let localizacao = "Localização Desconhecida";

    try {
        const respostaGeo = await fetch(`http://ip-api.com/json/${ip}`);
        const dadosGeo = await respostaGeo.json();
        if (dadosGeo.status === 'success') {
            localizacao = `${dadosGeo.city}, ${dadosGeo.regionName} - ${dadosGeo.country}`;
        }
    } catch (erro) {
        console.error("Falha ao buscar localização:", erro);
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Formatação de tempo
    const minutos = Math.floor(tempoSegundos / 60);
    const segundos = tempoSegundos % 60;
    const tempoFormatado = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;

    // Salva no Supabase
    const { error } = await supabase
        .from('acessos')
        .insert([{ 
            data_hora: dataHora, 
            ip: ip, 
            localizacao: localizacao, 
            pagina: pagina, 
            tempo_uso: tempoFormatado 
        }]);

    if (error) console.error("Erro ao salvar no Supabase:", error);
    else console.log(`📊 Salvo no BD: ${dataHora} | ${pagina} | ${tempoFormatado}`);

    res.sendStatus(200);
});

// Rota para gerar relatório CSV
app.get('/baixar-relatorio', async (req, res) => {
    if (!req.session.logado) return res.redirect('/login');

    const { data, error } = await supabase.from('acessos').select('*');

    if (error) return res.status(500).send("Erro ao buscar relatórios.");

    let csv = 'Data e Hora,Endereço IP,Localização,Página Acessada,Tempo de Uso\n';

    if (data) {
        data.forEach(acesso => {
            // Pequena sanitização para evitar quebra do CSV
            const loc = acesso.localizacao ? acesso.localizacao.replace(/,/g, ' -') : '';
            csv += `"${acesso.data_hora}","${acesso.ip}","${loc}","${acesso.pagina}","${acesso.tempo_uso}"\n`;
        });
    }

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('Relatorio_Acessos_Painel.csv');
    return res.send(csv);
});

// --- MIDDLEWARE DE PROTEÇÃO DE ROTAS (Gatekeeper) ---
app.use((req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
});

// Serve os arquivos estáticos (HTML, CSS, JS) somente se logado (pois está abaixo do gatekeeper)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});