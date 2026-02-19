const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: true }));

// Configuração de sessão para manter o usuário logado
app.use(session({
    secret: 'chave-secreta-do-meu-projeto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Expira em 24h
}));

// Rota GET: Exibe a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota POST: Processa a autenticação
app.post('/fazer-login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === process.env.MEU_USUARIO && senha === process.env.MINHA_SENHA) {
        req.session.logado = true;
        res.redirect('/');
    } else {
        res.send('<h3>Usuário ou senha incorretos!</h3><a href="/login">Voltar e tentar novamente</a>');
    }
});

// Rota para encerrar a sessão (Logout)
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Middleware de Autenticação: Protege o acesso aos arquivos estáticos
app.use((req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
});

// Arquivos estáticos (HTML, CSS, JS do painel) liberados apenas após o login
app.use(express.static(path.join(__dirname, 'public')));

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});