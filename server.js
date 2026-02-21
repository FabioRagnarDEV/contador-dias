const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Necessário para o Render identificar corretamente o IP do utilizador
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Configuração da sessão (mantém o utilizador logado por 24 horas)
app.use(session({
    secret: 'chave-secreta-do-meu-projeto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Memória temporária para o sistema anti-força bruta (Rate Limiting)
const controleTentativas = {}; 

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Processa a tentativa de login e gere os bloqueios
app.post('/fazer-login', (req, res) => {
    const { usuario, senha } = req.body;
    const ip = req.ip; 

    if (!controleTentativas[ip]) {
        controleTentativas[ip] = { falhas: 0, bloqueadoAte: null };
    }

    const controle = controleTentativas[ip];
    
    // 1. Impede o acesso se o IP ainda estiver no período de bloqueio
    if (controle.bloqueadoAte && controle.bloqueadoAte > Date.now()) {
        return res.redirect('/login?erro=bloqueado'); 
    }

    // Liberta o IP caso o tempo de bloqueio já tenha passado
    if (controle.bloqueadoAte && controle.bloqueadoAte <= Date.now()) {
        controle.falhas = 0;
        controle.bloqueadoAte = null;
    }

    // 2. Valida as credenciais com as variáveis de ambiente (.env)
    if (usuario === process.env.MEU_USUARIO && senha === process.env.MINHA_SENHA) {
        req.session.logado = true;
        controle.falhas = 0; 
        res.redirect('/');
    } else {
        // 3. Em caso de erro, regista a falha e bloqueia por 10 min se chegar a 3
        controle.falhas += 1;
        const tentativasRestantes = 3 - controle.falhas;

        if (controle.falhas >= 3) {
            controle.bloqueadoAte = Date.now() + 10 * 60 * 1000;
            return res.redirect('/login?erro=bloqueado');
        } else {
            return res.redirect(`/login?erro=invalida&restantes=${tentativasRestantes}`);
        }
    }
});

// Rota para destruir a sessão ativa
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Middleware de Proteção: Bloqueia o acesso aos ficheiros estáticos se não houver sessão
app.use((req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

// --- SISTEMA DE ANALYTICS (Rastreamento de Uso) ---
app.post('/api/rastrear', (req, res) => {
    // Registra se o usuário estiverLogado
    if (!req.session.logado) return res.sendStatus(401);

    const { pagina, tempoSegundos } = req.body;
    const ip = req.ip;
    const dataHora = new Date().toLocaleString('pt-BR');

    const minutos = Math.floor(tempoSegundos / 60);
    const segundos = tempoSegundos % 60;
    const tempoFormatado = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;
    console.log(`📊 [ANALYTICS] Data: ${dataHora} | IP: ${ip} | Página: ${pagina} | Tempo de Uso: ${tempoFormatado}`);

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});