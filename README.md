# 🚀 Painel de Ferramentas de Cálculo de Prazos

## 📝 Descrição Geral

Este projeto é um **Painel de Ferramentas interativo**, desenvolvido para otimizar e facilitar o cálculo de prazos críticos relacionados a processos de consórcio.

A aplicação centraliza diversas calculadoras numa interface limpa, responsiva e amigável. O grande diferencial é o seu **sistema de temas dinâmico e sincronizado**, que garante uma identidade visual unificada e uma experiência de utilizador surpreendente a cada visita.

O painel foi desenhado para ser **intuitivo**, começando com uma **saudação personalizada** que reconhece o utilizador e o seu género (via API do IBGE) e apresentando um **menu claro** com acesso a todas as ferramentas, cada uma com suas próprias microinterações.

---

## ✨ Funcionalidades Principais

### 🎨 Sistema de Temas Aleatórios e Sincronizados

A experiência do utilizador foi o foco principal, resultando em uma interface que é ao mesmo tempo funcional e visualmente cativante.

* **Experiência Única a Cada Visita**: Ao carregar a página principal, um tema é **sorteado aleatoriamente** de uma paleta com mais de **20 combinações de cores vibrantes**. Isso garante que a aplicação tenha sempre um visual novo e moderno.
* **Consistência Visual Total**: Utilizando o `LocalStorage` do navegador, o tema sorteado é **salvo e aplicado a todas as páginas** da aplicação. Ao navegar para qualquer calculadora, o utilizador mantém a mesma identidade visual, criando uma experiência coesa e profissional.
* **Microinterações e Animações**: Para reforçar a identidade de cada ferramenta, os ícones ganharam vida com animações CSS temáticas e contínuas:
    * **Crédito em Espécie**: O ícone do dinheiro flutua suavemente.
    * **Direito de Arrependimento**: A caneta simula o movimento de uma assinatura.
    * **Pós Vendas**: Balões de diálogo animados aparecem ao interagir com o ícone.
    * **Análise de Atraso**: Um alerta visual pulsa sobre o ícone de calendário.

### 🏠 Página Inicial (`index.html`)

A porta de entrada para as ferramentas, com funcionalidades focadas na experiência do utilizador:

* **Saudação Personalizada**: A aplicação pergunta o nome do utilizador através de um modal customizado na primeira visita.
* **Deteção de Género (API IBGE)**: O nome fornecido é consultado na API de Nomes do IBGE para personalizar a saudação para *"bem-vindo"* ou *"bem-vinda"*.
* **Memória Local**: O nome e o género são guardados, garantindo que a saudação personalizada acompanhe o utilizador em **todas as páginas**.
* **Navegação 3D**: O menu apresenta as calculadoras em formato de *cards* com efeito 3D que reagem ao mouse.

---

## 🧰 As Calculadoras

### 📌 Prazo Crédito em Espécie

Calcula o prazo para um consorciado contemplado receber o crédito em dinheiro.
* **Lógica**: Adiciona 180 dias à data de contemplação (para grupos ativos) ou verifica se a data de encerramento já passou.
* **Recursos**: Inclui a Cláusula 32 do regulamento para consulta.

### 📌 Direito de Arrependimento

Verifica se o cliente está dentro do prazo legal de 7 dias para desistir do contrato.
* **Lógica**: Conta 7 dias corridos a partir do pagamento da 1ª parcela.
* **Recursos**: Mostra a data e hora limite e relaciona o Art. 49 do CDC com as cláusulas contratuais.

### 📌 Pós Vendas

Ferramenta dupla para gerir prazos do setor de pós-vendas.
* **Lógica**: Calcula 48 horas úteis (PVD) ou o prazo restante de 50 dias úteis (Caso de Desvio), desconsiderando feriados nacionais (via API).
* **Recursos**: Inclui um manual completo sobre as regras e prazos do setor.

### 📌 Análise de Atraso

Ferramenta estratégica para avaliar o risco de cancelamento de cotas com parcelas em atraso.
* **Lógica**: Calcula os dias de atraso e o número de parcelas em aberto para determinar o nível de risco (Baixo, Médio, Alto ou Crítico) e a ação correspondente (exclusão, cancelamento), com regras diferentes para clientes contemplados e não contemplados.
* **Recursos**: Exibe as regras de cancelamento específicas para cada cenário.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** → Estrutura semântica e moderna.
* **Tailwind CSS** → Estilização rápida, responsiva e baseada em utilitários.
* **JavaScript (ES6+)** → Interatividade, manipulação do DOM, cálculos e consumo de APIs.
* **LocalStorage API** → Para sincronização de temas e persistência de dados do utilizador.
* **Animações CSS3** → Animações fluidas com `@keyframes`, `transitions` e `transforms`.
* **APIs Externas**:
    * [BrasilAPI](https://brasilapi.com.br/) → Lista de feriados nacionais para cálculos de dias úteis.
    * [API de Nomes do IBGE](https://servicodados.ibge.gov.br/api/docs/nomes) → Deteção de género para personalização da UI.

---

## 📁 Estrutura do Projeto

/PAINEL_CALCULADORAS
│
├── /assets
│   ├── calendario.png
│   ├── credito_especie.png
│   ├── pos_vendas.png
│   ├── arrependimento.png
│   └── pagamento-atrasado.png
│
├── /CalculadoraAtraso
│   ├── analiseAtraso.html
│   └── script.js
│
├── /CalculadoraCreditoEspecie
│   ├── creditoEmEspecie.html
│   └── script.js
│
├── /CalculadoraPosVendas
│   ├── posVendas.html
│   └── script.js
│
├── /LeiArrependimento
│   ├── leiArrependimento.html
│   └── leiArrependimento.js
│
├── /favicon
│   └── calendario.png
│
├── index.html
└── README.md


---

## 🚀 Como Executar

1.  Clone ou faça o download deste repositório.
2.  Certifique-se de que a estrutura de ficheiros e pastas seja mantida.
3.  Abra o ficheiro `index.html` em qualquer navegador moderno (Google Chrome, Firefox, Edge, etc.).

A aplicação será executada **localmente**, sem necessidade de um servidor web.

---