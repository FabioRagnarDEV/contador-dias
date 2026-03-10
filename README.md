# 🚀 Painel de Ferramentas de Cálculo de Prazos

## 📝 Visão Geral

O **Painel de Ferramentas de Cálculo de Prazos** é uma aplicação web interativa desenvolvida para **otimizar e automatizar cálculos de prazos críticos** relacionados a processos de consórcio.

O sistema centraliza diversas calculadoras em uma interface **limpa, responsiva e intuitiva**, construída sobre uma base de **Arquitetura Limpa (Clean Architecture)** e práticas rigorosas de **Segurança da Informação (AppSec)**. Oferece uma experiência visual dinâmica com temas sincronizados e microinterações que tornam o uso fluido e envolvente.

---

## 🛡️ Arquitetura e Segurança Avançada (Nível Enterprise)

A aplicação foi refatorada para uma arquitetura Full-Stack (Node.js + Express + Supabase), seguindo os mais altos padrões de segurança e resiliência:

- **Autenticação em Duas Etapas (2FA):** O acesso ao painel exige dupla validação. Após a verificação da senha (criptografada em Hash com `bcrypt`), o sistema exige um token TOTP gerado via **Google Authenticator** (`speakeasy`), mitigando riscos de vazamento de credenciais.
- **Persistência de Sessão Resiliente:** Sessões armazenadas diretamente no banco de dados PostgreSQL (`connect-pg-simple`), garantindo que os usuários permaneçam logados de forma segura (validade de 30 dias) mesmo em caso de reinicializações do servidor em nuvem. Conexão otimizada via IPv4 Connection Pooling com SSL.
- **Proteção contra Bots e Força Bruta:** Implementação do **Cloudflare Turnstile** (Captcha invisível) e **Rate Limiting** (bloqueio automático de IP por 20 minutos após 5 tentativas falhas de login).
- **Controle de Acesso Baseado em Função (RBAC):** Sistema rígido de autorização. Apenas usuários com a role `admin` possuem acesso ao painel de provisionamento para gerar novos convites e QR Codes de acesso para a equipe.
- **Middleware Global de Segurança (`requireAuth`):** Todas as rotas da API e documentos internos são blindadas no servidor. É impossível acessar endpoints diretamente via URL ou ferramentas como Postman sem uma sessão criptografada válida.
- **Validação Estrita de Inputs (Sanitização):** Utilização da biblioteca **Joi** para validar todos os dados que chegam do front-end. Previne injeções maliciosas e garante que o servidor só processe dados no formato exato esperado.
- **Tratamento Cego de Erros:** Middlewares globais interceptam falhas no servidor e devolvem mensagens genéricas ao cliente, impedindo o vazamento de *stack traces* ou da topologia da infraestrutura.
- **Compliance e LGPD (Minimização de Dados):** O sistema atua de forma proativa na proteção de dados. **Nenhum dado sensível de cliente (CPF, Nome, Contas) é processado ou armazenado no Banco de Dados.** O servidor transaciona apenas parâmetros matemáticos (datas e tipos de operação), reduzindo a zero o risco de exposição de PII (Personally Identifiable Information).

---

## ✨ Funcionalidades Principais (UX/UI)

### 🎨 Sistema de Temas Aleatórios e Sincronizados
A experiência do utilizador foi o foco principal, resultando em uma interface visualmente cativante e tecnicamente consistente.

- **Tema Aleatório a Cada Sessão** → Ao carregar a página, o sistema sorteia automaticamente um tema dentre mais de **20 combinações de cores vibrantes**.
- **Persistência de Tema** → O tema selecionado é armazenado no `LocalStorage` e aplicado globalmente a todas as páginas.
- **Microinterações Dinâmicas**:
  - 💸 **Crédito em Espécie**: Ícone de dinheiro com animação flutuante.
  - 🖊️ **Direito de Arrependimento**: Caneta com movimento de assinatura.
  - 💬 **Pós-Vendas**: Balões de diálogo animados durante a interação.
  - 📅 **Análise de Atraso**: Alerta pulsante sobre o calendário.

---

### 🏠 Página Inicial (`index.html`)

A porta de entrada do painel, projetada para uma **experiência personalizada**.

- **Saudação Personalizada** → A aplicação solicita o nome do utilizador na primeira visita.
- **Detecção de Gênero (API IBGE)** → O sistema consulta o nome fornecido e adapta a saudação: *“Bem-vindo”* ou *“Bem-vinda”*.
- **Persistência Local** → Nome e gênero são salvos para manter a personalização em todas as páginas.
- **Menu 3D Interativo** → As calculadoras são exibidas em *cards* com efeito 3D responsivo ao movimento do mouse.

---

## 🧮 Calculadoras Disponíveis

### 📌 **Crédito em Espécie**
Calcula o prazo para um consorciado contemplado receber o crédito em dinheiro ou usar o crédito para abater o saldo devedor.
- **Lógica:** Adiciona 180 dias à data de contemplação (grupos ativos) ou verifica encerramento do grupo.
- **Módulo de Compensação:** Subtrai o Saldo Devedor do Crédito Disponível para projetar o valor líquido de faturamento.
- **Extras:** Exibe a **Cláusula 32** do regulamento para referência.

### 📌 **Direito de Arrependimento**
Verifica se o cliente está dentro do prazo legal de 7 dias para desistir do contrato.
- **Lógica:** Conta 7 dias corridos a partir do pagamento da 1ª parcela.
- **Segurança UX:** Alertas automáticos caso o 7º dia caia em um final de semana.
- **Extras:** Mostra contagem projetada dia a dia e cita o **Art. 49 do CDC** e Cláusula 53.

### 📌 **Pós-Vendas**
Gerencia prazos do setor de pós-vendas de forma prática e automatizada, desconsiderando fins de semana e feriados nacionais.
- **Lógica:** Calcula 48 horas úteis (PVD), 50 dias úteis (Casos de Pós Vendas) ou 90 dias corridos (Divergência na venda).
- **Integração:** Consome a BrasilAPI de forma assíncrona para mapear feriados do ano em tempo real.
- **Extras:** Manual em formato grid com alertas visuais sobre regras de SLA do setor.

### 📌 **Análise de Atraso & Simulador de Devolução**
Uma ferramenta completa para gestão de inadimplência, cálculo de restituição (SAC) e automação de scripts de atendimento.
- **Análise de Risco:** Avalia a situação da cota (Cobrança simples, cancelamento, busca e apreensão).
- **Simulador Financeiro (Lei 11.795/08):** Separa Fundo Comum, aplica multas penais inteligentes (isenta se >50% pago) e calcula descontemplação.
- **Gerador de Scripts 🤖:** Cria textos padronizados para WhatsApp (curtos) e E-mail (jurídicos e formais).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|--------|-------------|-------------|
| **Back-end** | **Node.js & Express** | Servidor web rápido, roteamento de API e controle de sessão segura |
| **Banco de Dados** | **Supabase (PostgreSQL)** | Armazenamento de usuários, persistência de sessões (`connect-pg-simple`) e logs |
| **Segurança** | **Bcrypt, Speakeasy, Joi, Helmet** | Hashing de senhas, Autenticação TOTP (2FA), Sanitização de Inputs e proteção de Headers |
| **Front-end** | **HTML5 & Vanilla JS (ES6+)** | Estrutura semântica, manipulação segura do DOM (prevenção XSS) e arquitetura SRP |
| **Estilização** | **Tailwind CSS** | Design responsivo, moderno e padronizado em todo o ecossistema |
| **APIs** | **BrasilAPI & IBGE** | Consumo dinâmico de feriados nacionais e probabilidade de gênero |
| **Infra** | **Render & Cloudflare** | Deploy contínuo, túnel HTTPS (SSL/TLS) e bloqueio de tráfego malicioso |

## 🛠️ Tecnologias Utilizadas

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📁 Estrutura do Projeto (Arquitetura Full-Stack)

O projeto segue um padrão de separação rigorosa entre Back-end (Infra/Servidor) e Front-end (Views/Controllers/Services protegidos).

```text
PAINEL_CALCULADORAS/
│
├── server.js                     # Servidor Node.js (Ponto de entrada, Autenticação, Middlewares)
├── package.json                  # Gerenciador de dependências
├── .env                          # Variáveis de ambiente (Segredos e Conexão DB) - Oculto
│
├── public/                       # Front-end (Arquivos estáticos servidos dinamicamente)
│   ├── index.html                # Dashboard Principal e Modal Admin
│   ├── login.html                # Interface de Autenticação Dupla
│   ├── assets/                   # Ícones, imagens e arquivos multimídia
│   ├── favicon/                  # Arquivos de ícone do navegador
│   │
│   ├── CalculadoraAtraso/
│   │   ├── analiseAtraso.html    # View (HTML)
│   │   ├── script.js             # Controller (Eventos e DOM)
│   │   └── consorcioService.js   # Service (Lógica de Negócio)
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
│   └── LeiArrependimento/
│       ├── leiArrependimento.html
│       ├── leiArrependimento.js
│       └── leiArrependimentoService.js