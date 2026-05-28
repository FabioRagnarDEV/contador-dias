# 🚀 Painel de Ferramentas de Cálculo de Prazos

## 📝 Visão Geral

O **Painel de Ferramentas de Cálculo de Prazos** é uma aplicação web full-stack desenvolvida para **otimizar e automatizar cálculos de prazos críticos** relacionados a processos de consórcio.

O sistema centraliza calculadoras especializadas, um painel administrativo e um módulo completo de monitoramento de segurança em uma interface **responsiva, temática e intuitiva**, construída sobre uma base de **Arquitetura Limpa** e práticas rigorosas de **Application Security (AppSec)**.

---

## 🛡️ Arquitetura e Segurança

A aplicação segue uma arquitetura Full-Stack (Node.js + Express + Supabase/PostgreSQL) com múltiplas camadas de proteção:

### Autenticação e Controle de Acesso

- **Autenticação em Duas Etapas (2FA):** Login com senha (hash `bcrypt`) + token TOTP via Google Authenticator (`speakeasy`), mitigando riscos de vazamento de credenciais.
- **Persistência de Sessão Resiliente:** Sessões armazenadas em PostgreSQL (`connect-pg-simple`) com validade de 30 dias, resistentes a reinicializações do servidor.
- **Proteção contra Bots e Força Bruta:** Cloudflare Turnstile (CAPTCHA invisível) + Rate Limiting (bloqueio automático de IP por 20 minutos após 5 tentativas falhas).
- **Controle de Acesso Baseado em Função (RBAC):** Apenas usuários `admin` acessam o painel de provisionamento de novos usuários.
- **Middleware Global (`requireAuth`):** Todas as rotas e arquivos estáticos são protegidos no servidor — impossível acessar sem sessão válida.

### Proteção de Dados e Inputs

- **Validação Estrita (Joi):** Todos os dados do front-end são validados antes do processamento.
- **Security Headers (Helmet):** CSP, HSTS, X-Frame-Options e demais headers de segurança configurados.
- **HTTP Parameter Pollution (HPP):** Prevenção contra manipulação de parâmetros duplicados.
- **Tratamento Cego de Erros:** Mensagens genéricas ao cliente, sem vazamento de stack traces.
- **Compliance LGPD:** Nenhum dado sensível de cliente (CPF, nome, contas) é armazenado. O servidor processa apenas parâmetros matemáticos (datas e tipos de operação).

---

## 🔍 Módulo de Monitoramento e Detecção de Anomalias

Sistema completo de segurança em tempo real, acessível via `/monitoramento`:

### Análise de Tráfego (`trafficAnalyzer`)

- **Detecção de Brute Force:** Identifica múltiplas tentativas de login falhadas por IP.
- **Detecção de Scanning:** Reconhece ferramentas como SQLMap, Nikto, Nmap, DirBuster, Burp Suite, Nuclei e outras via User-Agent.
- **Detecção de Flood/DDoS:** Monitora taxa de requisições por IP com limites configuráveis.
- **Scanning de Rotas:** Detecta IPs acessando rotas suspeitas (`/wp-admin`, `/.env`, `/phpmyadmin`, etc.).
- **Excesso de 404:** Identifica enumeração de endpoints por volume de erros.
- **Threat Score:** Sistema de pontuação cumulativa por IP baseado em múltiplos indicadores.
- **Bloqueio Automático:** IPs com comportamento malicioso são bloqueados por 30 minutos.

### Sistema de Alertas (`alertSystem`)

- **Níveis de Severidade:** LOW, MEDIUM, HIGH, CRITICAL.
- **Cooldown Inteligente:** Evita spam de alertas repetidos por IP/tipo.
- **Persistência em Arquivo:** Alertas gravados em logs diários (`logs/alerts-YYYY-MM-DD.log`).
- **Estatísticas:** Contadores por tipo e severidade para análise histórica.

### Dashboard de Monitoramento

- **Stream em Tempo Real (SSE):** Eventos de segurança transmitidos via Server-Sent Events.
- **Logs de Segurança:** Visualização filtrada com sanitização de dados sensíveis.
- **Métricas Globais:** Total de requisições, bloqueios, anomalias, tentativas de brute force e scanning.
- **Interface Dedicada:** Painel visual separado para acompanhamento operacional.

### Logger Estruturado

- **Logs Categorizados:** Arquivos separados por tipo (`app`, `security`, `alerts`) e data.
- **Rotação Diária:** Um arquivo por dia por categoria.
- **Sanitização Automática:** Dados sensíveis removidos antes da gravação.

---

## ✨ Experiência do Usuário

### Sistema de Temas

- **20+ Temas de Cores:** Sorteio aleatório a cada sessão com persistência em `localStorage`.
- **Sincronização Global:** Tema aplicado consistentemente em todas as páginas.
- **Microinterações Dinâmicas:**
  - 💸 Crédito em Espécie: Ícone de dinheiro com animação flutuante.
  - 🖊️ Direito de Arrependimento: Caneta com movimento de assinatura.
  - 💬 Pós-Vendas: Balões de diálogo animados.
  - 📅 Análise de Atraso: Alerta pulsante sobre o calendário.

### Personalização

- **Saudação Personalizada:** Solicita o nome na primeira visita.
- **Detecção de Gênero (API IBGE):** Adapta a saudação (*"Bem-vindo"* / *"Bem-vinda"*).
- **Menu 3D Interativo:** Cards com efeito 3D responsivo ao movimento do mouse.

### Rastreamento de Uso

- **Registro de Visitas:** Páginas acessadas com duração de permanência.
- **Geolocalização por IP:** Identificação de região via ip-api.com.
- **Exportação CSV:** Relatório de acessos disponível para administradores.

---

## 🧮 Calculadoras Disponíveis

### 📌 Crédito em Espécie

Calcula o prazo para um consorciado contemplado receber o crédito em dinheiro ou usar para abater saldo devedor.

- **Lógica:** 180 dias após contemplação (grupos ativos) ou verificação de encerramento do grupo.
- **Módulo de Compensação:** Subtrai Saldo Devedor do Crédito Disponível para projetar valor líquido.
- **Referência Legal:** Exibe a Cláusula 32 do regulamento.
- **Feedback Sonoro:** Efeito sonoro ao concluir cálculo.

### 📌 Direito de Arrependimento

Verifica se o cliente está dentro do prazo legal de 7 dias para desistir do contrato (Art. 49 do CDC).

- **Lógica:** 7 dias corridos a partir da alocação da cota.
- **Alertas Inteligentes:** Aviso automático quando o 7º dia cai em final de semana.
- **Contagem Visual:** Projeção dia a dia do prazo.
- **Referência Legal:** Art. 49 do CDC e Cláusula 44 do regulamento.

### 📌 Pós-Vendas

Gerencia prazos do setor de pós-vendas com exclusão automática de fins de semana e feriados nacionais.

| Tipo | Prazo |
|------|-------|
| PVD (Pós-Vendas Digital) | 48 horas úteis |
| Caso Pós-Vendas | 50 dias úteis |
| Divergência na Venda | 90 dias corridos |

- **Integração BrasilAPI:** Consulta assíncrona de feriados nacionais em tempo real.
- **Manual Integrado:** Grid com alertas visuais sobre regras de SLA.

### 📌 Análise de Atraso & Simulador de Devolução

Ferramenta completa para gestão de inadimplência, cálculo de restituição e automação de scripts de atendimento.

- **Análise de Risco:** Avalia situação da cota (cobrança simples, cancelamento, busca e apreensão).
- **Duas Unidades de Negócio:** Embracon/Renault e CNVW/Stara/Unicred/Cresol com regras distintas.
- **Regras por Data de Inauguração:** Diferentes critérios de cancelamento conforme período do grupo.
- **Simulador Financeiro (Lei 11.795/08):**
  - Separação de Fundo Comum
  - Multa penal inteligente (isenta se >50% pago)
  - Multa escalonada 0-20% (Cláusula 42)
  - Cálculo de descontemplação (Parágrafo 15)
- **Gerador de Scripts:** Textos padronizados para WhatsApp (curtos) e E-mail (jurídicos/formais).

---

## 👤 Painel Administrativo

Acessível apenas para usuários com role `admin`:

- **Criação de Usuários:** Provisiona novos acessos com geração automática de QR Code para 2FA.
- **Reset de Credenciais:** Regenera tokens de autenticação.
- **Localização:** Canto inferior esquerdo do dashboard principal.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|--------|------------|------------|
| **Runtime** | Node.js | Servidor de aplicação |
| **Framework** | Express.js 5.x | Roteamento, middlewares e API |
| **Banco de Dados** | PostgreSQL (Supabase) | Usuários, sessões e logs |
| **Sessões** | connect-pg-simple | Persistência de sessão em PostgreSQL |
| **Autenticação** | bcrypt, speakeasy, qrcode | Hash de senhas, TOTP 2FA, QR Codes |
| **Segurança** | helmet, hpp, joi, express-rate-limit | Headers, validação, rate limiting |
| **CAPTCHA** | Cloudflare Turnstile | Proteção contra bots |
| **Front-end** | HTML5, Vanilla JS (ES6+) | Interface e lógica de apresentação |
| **Estilização** | Tailwind CSS | Design responsivo e moderno |
| **APIs Externas** | BrasilAPI, IBGE, ip-api.com | Feriados, gênero, geolocalização |
| **Infraestrutura** | Render, Cloudflare | Deploy, HTTPS e proteção de borda |

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📁 Estrutura do Projeto

```text
PAINEL_CALCULADORAS/
│
├── server.js                          # Servidor principal (autenticação, rotas, middlewares)
├── criar-usuario.js                   # Script utilitário para criação de usuários
├── package.json                       # Dependências e scripts
├── .env                               # Variáveis de ambiente (não versionado)
│
├── monitoring/                        # Módulo de Monitoramento e Segurança
│   ├── index.js                       # Exportação centralizada do módulo
│   ├── middleware.js                  # Middleware de análise de requisições
│   ├── routes.js                      # Rotas da API de monitoramento
│   ├── trafficAnalyzer.js             # Análise de tráfego e detecção de anomalias
│   ├── alertSystem.js                 # Sistema de alertas com severidade
│   ├── logger.js                      # Logger estruturado com rotação diária
│   └── frontend/
│       └── monitoramento.html         # Dashboard de monitoramento (SSE)
│
├── logs/                              # Logs gerados automaticamente
│   ├── app-YYYY-MM-DD.log            # Logs de aplicação
│   ├── security-YYYY-MM-DD.log       # Logs de segurança
│   └── alerts-YYYY-MM-DD.log         # Logs de alertas
│
├── public/                            # Front-end (protegido por autenticação)
│   ├── index.html                     # Dashboard principal + painel admin
│   ├── assets/                        # Imagens, ícones e áudio
│   ├── favicon/                       # Favicon do navegador
│   │
│   ├── CalculadoraAtraso/
│   │   ├── analiseAtraso.html         # View
│   │   ├── script.js                  # Controller (eventos e DOM)
│   │   └── consorcioService.js        # Service (lógica de negócio)
│   │
│   ├── CalculadoraCreditoEspecie/
│   │   ├── creditoEmEspecie.html
│   │   ├── script.js
│   │   └── creditoService.js
│   │
│   ├── CalculadoraPosVendas/
│   │   ├── posVendas.html
│   │   ├── script.js
│   │   └── posVendasService.js
│   │
│   ├── LeiArrependimento/
│   │   ├── leiArrependimento.html
│   │   ├── leiArrependimento.js
│   │   └── leiArrependimentoService.js
│   │
│   └── Monitoramento/
│       └── monitoramento.html         # Redirect para dashboard de monitoramento
│
└── login.html                         # Página de login (2FA + Turnstile)
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (padrão: 3000) |
| `NODE_ENV` | Ambiente (`development` / `production`) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave de serviço do Supabase |
| `SESSION_SECRET` | Segredo para assinatura de sessões |
| `TURNSTILE_SECRET` | Chave secreta do Cloudflare Turnstile |
| `DATABASE_URL` | String de conexão PostgreSQL |

---

## 🚀 Deploy

### Pré-requisitos

- Node.js 18+
- PostgreSQL (via Supabase ou instância própria)
- Conta Cloudflare (para Turnstile)

### Instalação Local

```bash
git clone https://github.com/FabioRagnarDEV/contador-dias.git
cd contador-dias
npm install
```

Crie um arquivo `.env` na raiz com as variáveis listadas acima, então:

```bash
npm start
```

### Deploy no Render

1. Conecte o repositório GitHub ao Render.
2. Configure as variáveis de ambiente no painel do Render (não use `.env` em produção).
3. Defina `NODE_ENV=production`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Health Check Path: `/ping`

---

## 📊 Dependências

```json
{
  "@supabase/supabase-js": "^2.97.0",
  "bcrypt": "^6.0.0",
  "connect-pg-simple": "^10.0.0",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "express-rate-limit": "^8.2.1",
  "express-session": "^1.19.0",
  "helmet": "^8.1.0",
  "hpp": "^0.2.3",
  "joi": "^18.0.2",
  "pg": "^8.20.0",
  "qrcode": "^1.5.4",
  "speakeasy": "^2.0.0"
}
```

---

## 👨‍💻 Autor

Desenvolvido por **FabioRagnarDEV**

---

## 📄 Licença

ISC
