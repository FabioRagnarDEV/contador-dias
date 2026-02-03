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

### 📌 **Análise de Atraso & Simulador de Devolução (Novo!)**
Uma ferramenta completa para gestão de inadimplência e cálculo de restituição (SAC).

#### 1. Análise de Risco
Avalia a situação da cota baseada na data de inauguração do grupo e parcelas em aberto.
- **Lógica de Cancelamento Automático:**
  - Grupos até 30/06/2024: Cancelamento com **2 parcelas**.
  - Grupos após 01/07/2024: Cancelamento com **3 parcelas**.
- **Classificação de Risco:** Diferencia cobrança simples, cancelamento administrativo e busca e apreensão (para contemplados).

#### 2. Simulador de Devolução (Lei 11.795/08)
Caso a cota seja identificada como cancelada, o sistema libera o **Simulador de Devolução**.
- **Cálculo Financeiro:**
  - Base: Fundo Comum amortizado.
  - Deduções: Taxa Adm, Fundo Reserva e Seguro (Cláusula 41).
  - Multas: 10% (Prejuízo ao Grupo) + Multa Penal Variável (0% a 20%, conforme Cláusula 42).
- **Descontemplação:** Calcula a diferença a pagar caso a cota estivesse contemplada (Diferença entre crédito atualizado do grupo e crédito do cliente + rendimentos).

#### 3. Base Legal Integrada
Acesso direto aos documentos normativos dentro da ferramenta:
- 📜 Regulamento Embracon (Cláusulas 39-42).
- ⚖️ Lei 11.795/08 (Lei dos Consórcios).
- 🏦 Normativos BCB (Carta Circular 3.432 e Resolução 285).

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-------------|-------------|
| **HTML5** | Estrutura semântica moderna |
| **Tailwind CSS** | Estilização responsiva baseada em utilitários |
| **JavaScript (ES6+)** | Interatividade, cálculos complexos e consumo de APIs |
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
│   ├── analiseAtraso.html    # HTML com Modais de Manual e Devolução
│   ├── script.js             # Lógica de atraso, cancelamento e cálculos financeiros
│   └── style.css             # Estilos específicos dos modais
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