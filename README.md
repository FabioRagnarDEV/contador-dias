# 🚀 Painel de Ferramentas de Cálculo de Prazos

## 📝 Visão Geral

O **Painel de Ferramentas de Cálculo de Prazos** é uma aplicação web interativa desenvolvida para **otimizar e automatizar cálculos de prazos críticos** relacionados a processos de consórcio.

O sistema centraliza diversas calculadoras em uma interface **limpa, responsiva e intuitiva**, oferecendo uma **experiência visual dinâmica** com temas sincronizados e microinterações que tornam o uso fluido e envolvente.

---

## ✨ Funcionalidades Principais

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
- **Deteção de Gênero (API IBGE)** → O sistema consulta o nome fornecido e adapta a saudação: *“Bem-vindo”* ou *“Bem-vinda”*.  
- **Persistência Local** → Nome e gênero são salvos para manter a personalização em todas as páginas.  
- **Menu 3D Interativo** → As calculadoras são exibidas em *cards* com efeito 3D responsivo ao movimento do mouse.

---

## 🧮 Calculadoras Disponíveis

### 📌 **Crédito em Espécie**
Calcula o prazo para um consorciado contemplado receber o crédito em dinheiro.  
- **Lógica:** Adiciona 180 dias à data de contemplação (grupos ativos) ou verifica encerramento do grupo.  
- **Extras:** Exibe a **Cláusula 32** do regulamento para referência.

---

### 📌 **Direito de Arrependimento**
Verifica se o cliente está dentro do prazo legal de 7 dias para desistir do contrato.  
- **Lógica:** Conta 7 dias corridos a partir do pagamento da 1ª parcela.  
- **Extras:** Mostra data e hora limite e cita o **Art. 49 do CDC**.

---

### 📌 **Pós-Vendas**
Gerencia prazos do setor de pós-vendas de forma prática e automatizada.  
- **Lógica:** Calcula 48 horas úteis (PVD) ou 50 dias úteis (Casos de Desvio), desconsiderando feriados via API.  
- **Extras:** Inclui manual detalhado com todas as regras aplicáveis.

---

### 📌 **Análise de Atraso**
Avalia o risco de cancelamento de cotas com parcelas em atraso.  
- **Lógica:** Calcula dias e parcelas em atraso para definir o nível de risco:  
  - 🟢 Baixo  
  - 🟡 Médio  
  - 🟠 Alto  
  - 🔴 Crítico  
- **Extras:** Exibe as **regras contratuais de cancelamento** conforme o tipo de consorciado.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-------------|-------------|
| **HTML5** | Estrutura semântica moderna |
| **Tailwind CSS** | Estilização responsiva baseada em utilitários |
| **JavaScript (ES6+)** | Interatividade, cálculos e consumo de APIs |
| **LocalStorage API** | Armazenamento local de dados e temas |
| **CSS3 Animations** | Microinterações com `@keyframes`, `transitions` e `transforms` |
| **APIs Externas** |  |
| → [BrasilAPI](https://brasilapi.com.br/) | Feriados nacionais (para cálculo de dias úteis) |
| → [API de Nomes do IBGE](https://servicodados.ibge.gov.br/api/docs/nomes) | Identificação de gênero para personalização |

---

## 📁 Estrutura do Projeto

```text
PAINEL_CALCULADORAS/
│
├── assets/
│   ├── calendario.png
│   ├── credito_especie.png
│   ├── pos_vendas.png
│   ├── arrependimento.png
│   └── pagamento-atrasado.png
│
├── CalculadoraAtraso/
│   ├── analiseAtraso.html
│   └── script.js
│
├── CalculadoraCreditoEspecie/
│   ├── creditoEmEspecie.html
│   └── script.js
│
├── CalculadoraPosVendas/
│   ├── posVendas.html
│   └── script.js
│
├── LeiArrependimento/
│   ├── leiArrependimento.html
│   └── leiArrependimento.js
│
├── favicon/
│   └── calendario.png
│
├── index.html
└── README.md

```

## 🚀 Como Executar

1.  Clone ou faça o download deste repositório.
2.  Certifique-se de que a estrutura de ficheiros e pastas seja mantida.
3.  Abra o ficheiro `index.html` em qualquer navegador moderno (Google Chrome, Firefox, Edge, etc.).

A aplicação será executada **localmente**, sem necessidade de um servidor web.

