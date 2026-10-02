<div align="center">

<img src="public/assets/calendario.png" alt="Ícone Painel de Prazos" width="80" />

# Painel Interativo de Prazos

**Aplicação web corporativa para automação de cálculos de prazos em processos de consórcio.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

</div>

---

## Visão Geral

O **Painel Interativo de Prazos** centraliza em um único lugar as calculadoras e ferramentas operacionais que equipes de consórcio utilizam no dia a dia. O objetivo é eliminar cálculos manuais, reduzir erros e dar agilidade ao atendimento.

O acesso é **totalmente restrito** — toda a aplicação é protegida por autenticação em dois fatores (senha + TOTP), garantindo que apenas colaboradores autorizados utilizem as ferramentas.

---

## Ferramentas disponíveis

### 💰 Crédito em Espécie
> `public/CalculadoraCreditoEspecie/`

Verifica se uma cota está apta para receber o crédito em espécie e calcula o prazo restante, com base na **Cláusula 32** do regulamento.

| Cenário | Regra |
|---|---|
| Grupo ativo | Carência de **180 dias** a partir da contemplação |
| Grupo encerrado | Liberação **imediata** após a última assembleia |

**Recursos:**
- Módulo de compensação: calcula o valor líquido após quitação do saldo devedor com o próprio crédito (Cláusula 32)
- Gerador de **script de e-mail** para o cliente quando o prazo ainda não foi cumprido, informando os dias restantes e a data de liberação
- Exibição automática das cláusulas e base legal ao final do cálculo

---

### ↩️ Direito de Arrependimento
> `public/LeiArrependimento/`

Calcula o prazo legal de **7 dias corridos** para desistência do contrato (Art. 49 do CDC / Cláusula 44), contados a partir da data de alocação da cota.

**Recursos:**
- O dia da alocação já conta como Dia 1
- Alerta automático quando o 7º dia cai em **fim de semana**, orientando consulta ao líder
- Botão **"Entenda a contagem"**: exibe a linha do tempo dos 7 dias com dia da semana por extenso
- Exibição do texto completo do Art. 49 do CDC e da Cláusula 44 após o cálculo, com links para os documentos oficiais

---

### 📋 Pós-Vendas
> `public/CalculadoraPosVendas/`

Verifica o status de prazo para três modalidades operacionais, com consulta de **feriados nacionais em tempo real** via BrasilAPI.

| Modalidade | Prazo | Tipo |
|---|---|---|
| Pós Vendas Digital (PVD) | 48 horas | Dias úteis |
| Caso Pós Vendas (CPV) | 50 dias | Dias úteis |
| Divergência na Venda (DV) | 90 dias | Dias corridos |

**Recursos:**
- Feriados consultados dinamicamente na **BrasilAPI** e cacheados por ano-sessão
- Orientação contextual de ação para cada resultado (dentro/fora do prazo)

---

### ⚠️ Análise de Atraso
> `public/CalculadoraAtraso/`

Ferramenta completa para gestão de inadimplência, com avaliação de risco e simulador financeiro de restituição.

**Cálculo de risco:**
- Avalia o status da cota: cobrança simples, risco de cancelamento ou busca e apreensão
- Regras de cancelamento diferenciadas por data de inauguração do grupo:
  - Grupos até 30/06/2024 → cancelamento com **2 parcelas** em atraso
  - Grupos a partir de 01/07/2024 → cancelamento com **3 parcelas** em atraso
- Suporte a múltiplas unidades de negócio (Embracon/Renault, CNVW, Stara/Unicred/Cresol)

**Simulador de Devolução (Cláusula 39 + Lei 11.795/08):**

| Faixa do fundo comum pago | Multa penal (Cl. 42) | Multa ao grupo (Cl. 41.1) |
|---|---|---|
| Até 20% | 20% | 10% |
| 20,1% a 40% | 15% | 10% |
| 40,1% a 50% | 10% | 10% |
| Acima de 50% | Isento | 10% |

**Recursos:**
- Cálculo de diferença de descontemplação (Parágrafo 15) para cotas com crédito pendente
- Memória de cálculo detalhada com cada etapa da dedução
- Gerador de **scripts de atendimento** para WhatsApp e e-mail, copiados direto para a área de transferência
- Os scripts gerados usam `[GRUPO E COTA]` como placeholder — nenhum dado sensível é inserido automaticamente

---

### 📊 Percentual de Lance
> `public/CalculadoraLance/`

Calcula e visualiza a representatividade de cada modalidade de lance em uma assembleia.

**Modalidades suportadas:** Lance Livre · Lance Fixo 50% · Lance Fixo 25% · Sorteio

**Recursos:**
- **Gráfico de rosca (donut) interativo** com D3.js v7 — hover nos arcos expande o segmento e exibe o percentual no centro
- Barras de progresso animadas por modalidade
- Alerta quando a soma das modalidades difere do total informado
- Modal com base legal: Cláusulas 19, 19.1, 19.1.1, 19.1.2, 20 e 21, com link para o regulamento

---

### 🏛️ Apuração de Assembleia
> `public/ApuracaoAssembleia/`

Apura os números de sorteio da Assembleia Geral Ordinária a partir do resultado da **Loteria Federal**, conforme a Cláusula 18 e Resolução BCB 285/23.

**Dois modos de operação:**

| Modo | Grupos | Extração |
|---|---|---|
| Centenas | Até 1.000 cotas | 3 centenas por prêmio × 5 prêmios = 15 centenas |
| Milhares | 1.001 a 10.000 cotas | 2 milhares por prêmio × 5 prêmios = 10 milhares |

**Recursos:**
- Exclusão automática de centenas/milhares acima do máximo de participantes
- Cálculo de números adicionais por subtração sucessiva para grupos entre 1.001 e 5.000
- Cálculo do **número de desempate de lance**
- Validação de cota contemplada: busca alternada (`+1`, `-1`, `+2`, `-2`...) com exibição de cada passo
- Destaque animado na badge correspondente ao encontrar a cota
- Animação visual durante o processamento (dado 3D girando + rolos de dígitos)

---

### 🔍 Validade do Laudo de Vistoria
> `public/prazoLaudoVistoria/`

Verifica se um laudo de vistoria ainda está dentro do prazo de validade de **45 dias corridos** a partir da data de aprovação.

**Recursos:**
- Barra de progresso visual mostrando quantos dos 45 dias já decorreram
- Grid com as três datas: aprovação · dias restantes/vencidos · vencimento
- Alerta de urgência automático quando restam **7 dias ou menos**
- Saudação personalizada por horário (Bom dia / Boa tarde / Boa noite) com nome do usuário
- Resultado nomeia o usuário diretamente: *"João, laudo dentro do prazo!"*
- Mensagens bem-humoradas aleatórias nos casos de laudo expirado, sorteadas a cada verificação

---

## Segurança

A aplicação foi projetada com segurança em camadas:

**Autenticação**
- Senha armazenada com hash `bcrypt` (salt 10)
- **2FA obrigatório** via TOTP (compatível com Google Authenticator / Authy), com janela de tolerância de 1 período
- CAPTCHA via **Cloudflare Turnstile** na etapa de credenciais
- Rate limiting: bloqueio automático após **5 tentativas falhas** em 20 minutos
- Sessões persistidas em **PostgreSQL** (resistentes a reinicializações do servidor)

**Proteção de rotas e dados**
- Proteção CSRF via double-submit token (usando `crypto` nativo do Node.js)
- `requireAuth` em todas as rotas e arquivos estáticos
- Validação de todos os inputs com **Joi**
- Headers de segurança via **Helmet** (CSP, HSTS, X-Frame-Options)
- Proteção contra HTTP Parameter Pollution (**hpp**)
- `trust proxy` ativado apenas em produção

**Privacidade**
- Nenhum IP gravado em banco de dados
- Nenhuma geolocalização ou rastreamento de navegação
- Logs contêm apenas eventos de autenticação (login, 2FA, erros de servidor)
- Scripts de atendimento gerados não incluem dados sensíveis de cotas ou clientes

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
| Front-end | HTML5 · Vanilla JS (ES6+) · Tailwind CSS (CDN) |
| Visualização | D3.js v7 |
| APIs externas | BrasilAPI (feriados nacionais) · IBGE (inferência de gênero) |
| Infraestrutura | Render · Cloudflare |

</div>

---

## Estrutura do projeto

```
painel-prazos/
│
├── server.js                          # Servidor principal — rotas, auth, middlewares
├── login.html                         # Página de login (2FA + Turnstile + CSRF)
├── criar-usuario.js                   # Script utilitário de provisionamento
├── package.json
├── .env                               # Variáveis de ambiente (não versionado)
│
├── logs/                              # Gerado automaticamente em runtime
│   ├── auth-YYYY-MM-DD.log            # Eventos de autenticação
│   ├── app-YYYY-MM-DD.log
│   ├── alerts-YYYY-MM-DD.log
│   └── security-YYYY-MM-DD.log
│
├── documentacao/
│   └── documentacao-tecnica.md        # Documentação técnica detalhada
│
└── public/                            # Front-end — protegido por requireAuth
    ├── index.html                     # Painel principal + admin modal
    ├── assets/                        # Imagens e áudio
    ├── favicon/
    │
    ├── CalculadoraCreditoEspecie/
    │   ├── creditoEmEspecie.html
    │   ├── creditoService.js          # Lógica de negócio
    │   └── script.js                  # Manipulação de DOM e eventos
    │
    ├── LeiArrependimento/
    │   ├── leiArrependimento.html
    │   ├── leiArrependimentoService.js
    │   └── leiArrependimento.js
    │
    ├── CalculadoraPosVendas/
    │   ├── posVendas.html
    │   ├── posVendasService.js        # Inclui integração BrasilAPI
    │   └── script.js
    │
    ├── CalculadoraAtraso/
    │   ├── analiseAtraso.html
    │   ├── consorcioService.js        # Regras de cancelamento e devolução
    │   ├── script.js                  # Inclui gerador de scripts de atendimento
    │   └── style.css
    │
    ├── CalculadoraLance/
    │   └── calculadoraLance.html      # D3.js inline (gráfico donut)
    │
    ├── ApuracaoAssembleia/
    │   ├── apuracao.html
    │   ├── apuracaoService.js         # Lógica Loteria Federal (centenas/milhares)
    │   └── apuracaoScript.js
    │
    └── prazoLaudoVistoria/
        ├── laudoVistoria.html
        ├── laudoService.js            # Cálculo dos 45 dias + mensagens
        └── script.js                  # UI, tema, saudação, renderização
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
# Crie um arquivo .env com as variáveis necessárias (veja a seção abaixo)

# 4. Inicie o servidor
npm start
```

### Variáveis de ambiente necessárias

```
NODE_ENV=development
PORT=3000
SESSION_SECRET=
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=
TURNSTILE_SECRET=
```

> **Nunca versione o arquivo `.env`.** Ele já está no `.gitignore`.

---

## Deploy

O projeto está configurado para deploy no **Render**:

```
Build Command:  npm install
Start Command:  npm start
```

Configure todas as variáveis de ambiente no painel do Render. Defina `NODE_ENV=production` para ativar cookies seguros e `trust proxy`.

---

## Painel Administrativo

Usuários com role `admin` têm acesso ao painel de gestão diretamente no menu principal:

| Ação | Descrição |
|---|---|
| Criar usuário | Provisiona acesso e gera QR Code para configuração do 2FA |
| Resetar credenciais | Invalida senha e segredo TOTP atual, gerando novo QR Code |

---

## Personalização visual

Cada usuário pode escolher entre **9 paletas de cor** para o tema da interface. A preferência é salva no `localStorage` e aplicada em todas as ferramentas:

| Paleta | Cores |
|---|---|
| Oceanic Teal | Cyan + Teal |
| Sunset Orange | Amber + Orange |
| Grape Soda | Fuchsia + Purple |
| Jungle Lime | Lime + Emerald |
| Hot Pink | Pink + Rose |
| Deep Sky | Sky + Indigo |
| Burning Sunset | Red + Orange |
| Minty Fresh | Green + Cyan |
| Cyberpunk Night | Indigo + Fuchsia |

---

<div align="center">

Desenvolvido por **[FabioRagnarDEV](https://github.com/FabioRagnarDEV)**

</div>
