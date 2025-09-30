🚀 Painel de Ferramentas de Cálculo de Prazos
📝 Descrição Geral
Este projeto é um Painel de Ferramentas interativo, desenvolvido para otimizar e facilitar o cálculo de prazos críticos relacionados a processos de consórcio. A aplicação centraliza diversas calculadoras numa interface limpa, moderna e amigável, construída com as mais recentes tecnologias web.

O painel foi desenhado para ser intuitivo, começando com uma saudação personalizada que reconhece o utilizador e o seu género, e apresentando um menu claro com acesso a todas as ferramentas disponíveis.

✨ Funcionalidades Principais
🏠 Página Inicial (index.html)
A porta de entrada para as ferramentas, com funcionalidades focadas na experiência do utilizador:

Saudação Personalizada: Ao entrar pela primeira vez, a aplicação pergunta o nome do utilizador através de um modal customizado.

Deteção de Género (API IBGE): O nome fornecido é consultado na API de Nomes do IBGE para determinar o género mais provável, personalizando a saudação para "bem-vindo" ou "bem-vinda".

Memória Local: O nome e o género são guardados no localStorage do navegador, para que a saudação seja automática nas visitas seguintes.

Menu de Navegação Intuitivo: Apresenta as calculadoras disponíveis em formato de "cards" interativos, com ícones personalizados e descrições claras.

🧰 As Calculadoras
1. Prazo Crédito em Espécie
Esta ferramenta calcula o prazo para que um consorciado contemplado possa receber o seu crédito em dinheiro, com base em duas situações distintas.

Inputs do Utilizador:

Data da Contemplação.

Uma opção para indicar se o grupo de consórcio já encerrou, o que revela um campo adicional para a data de encerramento.

Lógica de Cálculo:

Se o grupo está ativo: A calculadora adiciona 180 dias à data da contemplação e informa a data a partir da qual o recebimento é permitido.

Se o grupo encerrou: A calculadora verifica se a data atual é posterior à data de encerramento. Em caso afirmativo, informa que o recebimento é imediato.

Informação Legal: Após o cálculo, a aplicação exibe uma secção informativa com uma síntese e os textos da Cláusula 32 e da RN 0134.

2. Direito de Arrependimento
Calculadora focada em verificar se um cliente está dentro do prazo legal de 7 dias para desistir de um contrato, conforme o Código de Defesa do Consumidor (CDC).

Input do Utilizador:

Data do Pagamento da 1ª Parcela.

Lógica de Cálculo:

A calculadora conta 7 dias corridos a partir da data do pagamento para determinar a data final do prazo.

O resultado informa claramente se o cliente ainda está no prazo, mostrando a data e hora limite (às 23:59).

Informação Legal: Exibe uma secção detalhada que conecta o Art. 49 do CDC com as Cláusulas 44, 53 e 53.1 do regulamento.

3. Pós Vendas
Uma ferramenta dupla para gerir prazos de atendimento no setor de pós-vendas.

Funcionalidade 1: Pós Vendas Digital

Input: Data da Efetivação.

Lógica: Calcula um prazo de 48 horas úteis (2 dias úteis), desconsiderando fins de semana e feriados (consultados via API).

Funcionalidade 2: Caso Pós Vendas

Inputs: Data de Abertura do Caso e Número do Caso.

Lógica: Calcula os dias úteis decorridos e informa quantos restam para o prazo final de 50 dias úteis.

🛠️ Tecnologias Utilizadas
HTML5: Para a estrutura semântica de todas as páginas.

Tailwind CSS: Para a estilização rápida, moderna e responsiva.

JavaScript (ES6+): Para toda a interatividade, lógica de cálculo e consumo de APIs.

APIs Externas:

BrasilAPI: Para obter a lista de feriados nacionais.

API de Nomes do IBGE: Para a funcionalidade de deteção de género.

📁 Estrutura do Projeto
O projeto está organizado de forma modular para facilitar a manutenção:

/PAINEL_CALCULADORAS
|
|-- /assets
|   |-- calendario.png
|   |-- credito-especie.png
|   |-- pos-vendas.png
|   |-- arrependimento.png
|
|-- /CalculadoraCreditoEspecie
|   |-- creditoEmEspecie.html
|   |-- script.js
|
|-- /CalculadoraPosVendas
|   |-- posVendas.html
|   |-- script.js
|
|-- /LeiArrependimento
|   |-- leiArrependimento.html
|   |-- leiArrependimento.js
|
|-- /favicon
|   |-- calendario.png
|
|-- index.html
|-- README.md
🚀 Como Executar
Certifique-se de que todos os ficheiros e pastas estão na mesma estrutura descrita acima.

Abra o ficheiro index.html em qualquer navegador de internet moderno (Google Chrome, Firefox, etc.).

A aplicação será executada localmente, sem a necessidade de um servidor