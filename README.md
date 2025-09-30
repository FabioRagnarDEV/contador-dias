# 🚀 Painel de Ferramentas de Cálculo de Prazos

## 📝 Descrição Geral

Este projeto é um **Painel de Ferramentas interativo**, desenvolvido para otimizar e facilitar o cálculo de prazos críticos relacionados a processos de consórcio.

A aplicação centraliza diversas calculadoras numa interface limpa, moderna e amigável, construída com as mais recentes tecnologias web.

O painel foi desenhado para ser **intuitivo**, começando com uma **saudação personalizada** que reconhece o utilizador e o seu género, e apresentando um **menu claro** com acesso a todas as ferramentas disponíveis.

---

## ✨ Funcionalidades Principais

### 🏠 Página Inicial (`index.html`)

A porta de entrada para as ferramentas, com funcionalidades focadas na experiência do utilizador:

* **Saudação Personalizada**: Ao entrar pela primeira vez, a aplicação pergunta o nome do utilizador através de um modal customizado.
* **Deteção de Género (API IBGE)**: O nome fornecido é consultado na API de Nomes do IBGE para determinar o género mais provável, personalizando a saudação para *"bem-vindo"* ou *"bem-vinda"*.
* **Memória Local**: O nome e o género são guardados no `localStorage` do navegador, para que a saudação seja automática nas visitas seguintes.
* **Menu de Navegação Intuitivo**: Apresenta as calculadoras disponíveis em formato de *cards* interativos, com ícones personalizados e descrições claras.

---

## 🧰 As Calculadoras

### 📌 Prazo Crédito em Espécie

Ferramenta que calcula o prazo para que um consorciado contemplado possa receber o crédito em dinheiro, com base em duas situações distintas.

**Inputs do Utilizador:**

* Data da Contemplação
* Opção indicando se o grupo de consórcio já encerrou (caso positivo, habilita campo adicional para a data de encerramento)

**Lógica de Cálculo:**

* **Grupo Ativo**: adiciona 180 dias à data da contemplação e informa a data de recebimento.
* **Grupo Encerrado**: se a data atual for posterior ao encerramento, o recebimento é imediato.

**Informação Legal:** Exibe uma secção informativa com a Cláusula 32 e a RN 0134.

---

### 📌 Direito de Arrependimento

Calcula se o cliente ainda está dentro do prazo legal de 7 dias para desistir do contrato, conforme o **CDC**.

**Input do Utilizador:**

* Data do Pagamento da 1ª Parcela

**Lógica de Cálculo:**

* Conta 7 dias corridos a partir do pagamento para determinar o prazo final.
* Mostra claramente se o cliente está dentro do prazo, com data e hora limite (23:59).

**Informação Legal:** Relaciona o **Art. 49 do CDC** com as Cláusulas 44, 53 e 53.1 do regulamento.

---

### 📌 Pós Vendas

Ferramenta dupla para gerir prazos no setor de pós-vendas:

1. **Pós Vendas Digital**

   * **Input**: Data da Efetivação
   * **Lógica**: Calcula 48 horas úteis (2 dias úteis), desconsiderando fins de semana e feriados (via API).

2. **Caso Pós Vendas**

   * **Inputs**: Data de Abertura e Número do Caso
   * **Lógica**: Calcula dias úteis decorridos e mostra quanto resta do prazo de 50 dias úteis.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** → Estrutura semântica
* **Tailwind CSS** → Estilização moderna e responsiva
* **JavaScript (ES6+)** → Interatividade, cálculos e consumo de APIs
* **APIs Externas**:

  * [BrasilAPI](https://brasilapi.com.br/) → Lista de feriados nacionais
  * [API de Nomes do IBGE](https://servicodados.ibge.gov.br/api/docs/nomes) → Deteção de género

---

## 📁 Estrutura do Projeto

```
/PAINEL_CALCULADORAS
│-- /assets
│   │-- calendario.png
│   │-- credito-especie.png
│   │-- pos-vendas.png
│   │-- arrependimento.png
│
│-- /CalculadoraCreditoEspecie
│   │-- creditoEmEspecie.html
│   │-- script.js
│
│-- /CalculadoraPosVendas
│   │-- posVendas.html
│   │-- script.js
│
│-- /LeiArrependimento
│   │-- leiArrependimento.html
│   │-- leiArrependimento.js
│
│-- /favicon
│   │-- calendario.png
│
│-- index.html
│-- README.md
```

---

## 🚀 Como Executar

1. Certifique-se de que todos os ficheiros e pastas estão na mesma estrutura acima.
2. Abra o ficheiro `index.html` em qualquer navegador moderno (Google Chrome, Firefox, etc.).
3. A aplicação será executada **localmente**, sem necessidade de servidor.

---
