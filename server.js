const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// 1. Importa e configura o Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Necessário para ler o relatório do frontend

app.use(session({
    secret: 'chave-secreta-do-meu-projeto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const controleTentativas = {}; 

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/fazer-login', (req, res) => {
    const { usuario, senha } = req.body;
    const ip = req.ip; 

    if (!controleTentativas[ip]) {
        controleTentativas[ip] = { falhas: 0, bloqueadoAte: null };
    }

    const controle = controleTentativas[ip];
    
    if (controle.bloqueadoAte && controle.bloqueadoAte > Date.now()) {
        return res.redirect('/login?erro=bloqueado'); 
    }

    if (controle.bloqueadoAte && controle.bloqueadoAte <= Date.now()) {
        controle.falhas = 0;
        controle.bloqueadoAte = null;
    }

    if (usuario === process.env.MEU_USUARIO && senha === process.env.MINHA_SENHA) {
        req.session.logado = true;
        controle.falhas = 0; 
        res.redirect('/');
    } else {
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

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// --- SISTEMA DE ANALYTICS COM SUPABASE ---
app.post('/api/rastrear', async (req, res) => {
    if (!req.session.logado) return res.sendStatus(401);

    const { pagina, tempoSegundos } = req.body;
    let ip = req.ip;

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
    const minutos = Math.floor(tempoSegundos / 60);
    const segundos = tempoSegundos % 60;
    const tempoFormatado = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;

    // 2. Salva o acesso DE VERDADE no Supabase
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

// 3. Rota para gerar relatório
app.get('/baixar-relatorio', async (req, res) => {
    if (!req.session.logado) return res.redirect('/login');

    // Busca todos os dados da tabela 'acessos'
    const { data, error } = await supabase.from('acessos').select('*');

    if (error) {
        return res.status(500).send("Erro ao buscar relatórios.");
    }

    let csv = 'Data e Hora,Endereço IP,Localização,Página Acessada,Tempo de Uso\n';

    // Se houver dados, preenche a planilha
    if (data) {
        data.forEach(acesso => {
            csv += `"${acesso.data_hora}","${acesso.ip}","${acesso.localizacao}","${acesso.pagina}","${acesso.tempo_uso}"\n`;
        });
    }

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('Relatorio_Acessos_Painel.csv');
    return res.send(csv);
});

// Middleware de Proteção
app.use((req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});