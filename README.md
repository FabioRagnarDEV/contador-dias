<div align="center">

# 📅 Painel Interativo de Prazos

**Aplicação web corporativa para automação de cálculos de prazos em processos de consórcio.**  
Desenvolvida com foco em segurança, privacidade e experiência do usuário.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)

</div>

---

## Sobre o projeto

O **Painel Interativo de Prazos** centraliza calculadoras especializadas para equipes que lidam diariamente com prazos legais e operacionais de consórcio. O objetivo é eliminar cálculos manuais, reduzir erros e dar agilidade ao atendimento.

A aplicação é de **acesso restrito** — todo o conteúdo é protegido por autenticação em duas etapas (senha + TOTP), garantindo que apenas colaboradores autorizados utilizem as ferramentas.

---

## Ferramentas disponíveis

### 💰 Crédito em Espécie
Calcula o prazo para recebimento do crédito após contemplação, com duas lógicas distintas:
- **Grupo ativo:** carência de 180 dias a partir da contemplação (Cláusula 32)
- **Grupo encerrado:** liberação imediata após a última assembleia
- **Módulo de compensação:** calcula o valor líquido após quitação do saldo devedor

### ↩️ Direito de Arrependimento
Verifica se o cliente está dentro do prazo legal de desistência (Art. 49 do CDC / Cláusula 44):
- Contagem de 7 dias corridos a partir da alocação da cota
- Alerta automático quando o prazo vence em fim de semana

### 📋 Pós-Vendas
Calcula prazos de atendimento com exclusão de fins de semana e **feriados nacionais em tempo real** (BrasilAPI):

| Modalidade | Prazo |
|---|---|
| PVD (Pós-Vendas Digital) | 48 horas úteis |
| Caso Pós-Vendas | 50 dias úteis |
| Divergência na Venda | 90 dias corridos |

### ⚠️ Análise de Atraso
Ferramenta completa para gestão de inadimplência:
- Avaliação do risco da cota (cobrança simples, cancelamento, busca e apreensão)
- Simulador financeiro de restituição (Lei 11.795/08) com multa escalonada
- Gerador de scripts de atendimento para WhatsApp e e-mail
- Suporte a múltiplas unidades de negócio (Embracon/Renault, CNVW/Stara/Unicred/Cresol)

### 📊 Percentual de Lance
Calcula a representatividade de cada modalidade de lance em uma assembleia usando **D3.js**:
- Percentual de Lance Livre, Lance Fixo 50% e Lance Fixo 25%
- Visualização com gráfico donut interativo (hover com detalhes por fatia)
- Barras de progresso animadas por modalidade
- Alerta quando a soma das modalidades difere do total informado

---

## Segurança e privacidade

A aplicação foi projetada com segurança em camadas e em conformidade com princípios de privacidade (minimização de dados):

**Autenticação**
- Senha com hash `bcrypt` (salt rounds 10)
- 2FA obrigatório via TOTP (Google Authenticator) com `window: 1`
- CAPTCHA invisível via Cloudflare Turnstile na etapa de credenciais
- Rate limiting: bloqueio após 5 tentativas em 20 minutos
- Sessões persistidas em PostgreSQL (resistentes a restart)

**Proteção de rotas e dados**
- CSRF protection via double-submit token (sem dependência externa, usando `crypto` nativo)
- `requireAuth` em todas as rotas e arquivos estáticos
- Validação de inputs com Joi em todos os endpoints
- Headers de segurança via Helmet (CSP, HSTS, X-Frame-Options)
- Proteção contra HTTP Parameter Pollution (hpp)
- `trust proxy` ativado apenas em produção

**Privacidade**
- Nenhum IP gravado em banco de dados
- Nenhuma geolocalização de usuários
- Nenhum rastreamento de navegação ou tempo de permanência
- Logs contêm apenas eventos de autenticação (login, 2FA, erros)

---

## Stack

<div align="center">

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5.x |
| Banco de dados | PostgreSQL via Supabase |
| Sessões | connect-pg-simple |
| Autenticação | bcrypt · speakeasy · qrcode |
| Segurança | helmet · hpp · joi · express-rate-limit |
| CAPTCHA | Cloudflare Turnstile |
| Front-end | HTML5 · Vanilla JS (ES6+) · Tailwind CSS |
| Visualização | D3.js v7 |
| APIs externas | BrasilAPI (feriados) · IBGE (gênero) |
| Infraestrutura | Render · Cloudflare |

</div>

---

## Estrutura do projeto

```
painel-prazos/
│
├── server.js                        # Servidor principal — rotas, auth, middlewares
├── login.html                       # Página de login (2FA + Turnstile + CSRF)
├── criar-usuario.js                 # Script utilitário de provisionamento
├── package.json
├── .env                             # Variáveis de ambiente (não versionado)
│
├── logs/                            # Logs de autenticação (gerados automaticamente)
│   └── auth-YYYY-MM-DD.log
│
└── public/                          # Front-end — protegido por requireAuth
    ├── index.html                   # Painel principal + admin modal
    ├── assets/                      # Imagens e áudio
    ├── favicon/
    ├── CalculadoraCreditoEspecie/
    ├── CalculadoraPosVendas/
    ├── CalculadoraAtraso/
    ├── CalculadoraLance/            # Percentual de Lance (D3.js)
    └── LeiArrependimento/
```

---

## Instalação local

```bash
# 1. Clone o repositório
git clone https://github.com/FabioRagnarDEV/contador-dias.git
cd contador-dias

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Inicie o servidor
npm start
```



## Deploy

O projeto está configurado para deploy no **Render**:

1. Conecte o repositório no painel do Render
2. Configure as variáveis de ambiente (nunca use `.env` em produção)
3. Defina `NODE_ENV=production`

```
Build Command:  npm install
Start Command:  npm start
```

---

## Painel administrativo

Usuários com role `admin` têm acesso ao painel de gestão (ícone no canto inferior esquerdo):

- **Criar usuário** — provisiona acesso e gera QR Code para configuração do 2FA
- **Resetar credenciais** — invalida senha e segredo TOTP atual, gerando novo QR Code

---

<div align="center">

Desenvolvido por **[FabioRagnarDEV](https://github.com/FabioRagnarDEV)**

</div>
