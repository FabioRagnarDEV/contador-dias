# Painel Interativo de Prazos

Aplicação web de acesso restrito para cálculo de prazos relacionados a processos de consórcio. Centraliza calculadoras especializadas em uma interface responsiva, protegida por autenticação em duas etapas.

---

## Calculadoras disponíveis

**Crédito em Espécie**
Calcula o prazo para recebimento do crédito após contemplação. Aplica lógica de 180 dias para grupos ativos e módulo de compensação de saldo devedor.

**Direito de Arrependimento**
Verifica se o cliente está dentro dos 7 dias corridos para desistência (Art. 49 do CDC / Cláusula 44). Alerta quando o prazo cai em fim de semana.

**Pós-Vendas**
Calcula prazos de atendimento com exclusão de fins de semana e feriados nacionais via BrasilAPI. Cobre PVD (48h úteis), Caso Pós-Vendas (50 dias úteis) e Divergência na Venda (90 dias corridos).

**Análise de Atraso**
Avalia situação de inadimplência, calcula restituição conforme Lei 11.795/08 e gera scripts de atendimento para WhatsApp e e-mail. Suporta Embracon/Renault e CNVW/Stara/Unicred/Cresol.

---

## Autenticação e segurança

- Login com senha (bcrypt) + token TOTP via Google Authenticator (2FA obrigatório)
- Cloudflare Turnstile (CAPTCHA) na etapa de credenciais
- Rate limiting: bloqueio após 5 tentativas falhas em 20 minutos
- Sessões persistidas em PostgreSQL (resistentes a restart do servidor)
- CSRF protection via double-submit token (sem dependência externa)
- Controle de acesso por função: `user` e `admin`
- Todas as rotas e arquivos estáticos protegidos por `requireAuth`
- Headers de segurança via Helmet (CSP, HSTS, X-Frame-Options)
- Proteção contra HTTP Parameter Pollution (hpp)
- Log de autenticação: apenas eventos de login/2FA/erro, sem dados de navegação ou IP

---

## Painel administrativo

Acessível apenas para usuários `admin` (botão no canto inferior esquerdo do painel):

- Criação de novos usuários com geração de QR Code para configuração do 2FA
- Reset de credenciais com regeneração do segredo TOTP

---

## Privacidade

A aplicação não coleta nem armazena dados de colaboradores. Especificamente:

- Nenhum IP é gravado em banco de dados
- Nenhuma geolocalização é realizada
- Nenhum dado de navegação ou tempo de permanência é registrado
- Logs contêm apenas eventos de autenticação (sem identificação de dispositivo ou localização)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 5.x |
| Banco de dados | PostgreSQL via Supabase |
| Sessões | connect-pg-simple |
| Autenticação | bcrypt, speakeasy, qrcode |
| Segurança | helmet, hpp, joi, express-rate-limit |
| CAPTCHA | Cloudflare Turnstile |
| Front-end | HTML5, Vanilla JS, Tailwind CSS |
| APIs externas | BrasilAPI (feriados), IBGE (gênero) |
| Infraestrutura | Render, Cloudflare |

---

## Estrutura do projeto

```
/
├── server.js                        # Servidor principal
├── login.html                       # Página de login (2FA + Turnstile)
├── package.json
├── .env                             # Variáveis de ambiente (não versionado)
├── logs/                            # Logs de autenticação (gerados automaticamente)
└── public/                          # Front-end (protegido por autenticação)
    ├── index.html                   # Painel principal
    ├── assets/
    ├── favicon/
    ├── CalculadoraAtraso/
    ├── CalculadoraCreditoEspecie/
    ├── CalculadoraPosVendas/
    └── LeiArrependimento/
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão: 3000) |
| `NODE_ENV` | `development` ou `production` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave de serviço do Supabase |
| `SESSION_SECRET` | Segredo para assinatura de sessões |
| `TURNSTILE_SECRET` | Chave secreta do Cloudflare Turnstile |
| `DATABASE_URL` | String de conexão PostgreSQL |

---

## Instalação local

```bash
git clone https://github.com/FabioRagnarDEV/contador-dias.git
cd contador-dias
npm install
```

Crie o arquivo `.env` com as variáveis acima e execute:

```bash
npm start
```

---

## Deploy (Render)

1. Conecte o repositório no painel do Render
2. Configure as variáveis de ambiente
3. Defina `NODE_ENV=production`
4. Build Command: `npm install`
5. Start Command: `npm start`

---

## Licença

ISC
