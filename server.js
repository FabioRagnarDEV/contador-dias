const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config(); // Carrega as informações do arquivo .env

const app = express();

// Configura o servidor para conseguir ler os dados digitados no formulário de login
app.use(express.urlencoded({ extended: true }));

// Configura a sessão (a "memória" que lembra que o usuário já digitou a senha certa)
app.use(session({
    secret: 'chave-secreta-do-meu-projeto', // Uma chave interna para criptografar a sessão
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // A sessão expira em 24 horas (em milissegundos)
}));

// Rota 1: Entrega a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota 2: Processa os dados que vieram do formulário
app.post('/fazer-login', (req, res) => {
    const usuarioDigitado = req.body.usuario;
    const senhaDigitada = req.body.senha;

    // Compara o que foi digitado com o que está guardado no seu .env
    if (usuarioDigitado === process.env.MEU_USUARIO && senhaDigitada === process.env.MINHA_SENHA) {
        req.session.logado = true; // Marca o usuário como logado
        res.redirect('/'); // Redireciona para o painel de calculadoras
    } else {
        res.send('<h3>Usuário ou senha incorretos!</h3><a href="/login">Voltar e tentar novamente</a>');
    }
});

// MIDDLEWARE DE PROTEÇÃO (O "Porteiro")
// Tudo que estiver abaixo desta linha só será acessado se o usuário estiver logado
app.use((req, res, next) => {
    if (req.session.logado) {
        next(); // Está logado? Pode passar para o próximo passo!
    } else {
        res.redirect('/login'); // Não está logado? Vai para a tela de login!
    }
});

// Rota 3: Libera o acesso aos arquivos do seu projeto (HTML, CSS, JS) que estão na pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Liga o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor protegido rodando em http://localhost:${PORT}`);
});