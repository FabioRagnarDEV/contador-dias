// --- Seleção dos Elementos do DOM ---
// Boa prática: selecionar os elementos uma vez no início do script.
const dataInputEl = document.getElementById('data');
const diasInputEl = document.getElementById('dias');
const calcularBtnEl = document.getElementById('calcular-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');


// --- Funções ---

/**
 * Formata o input de data para o formato DD/MM/AAAA enquanto o utilizador digita.
 * @param {HTMLInputElement} input O elemento input da data.
 */
function formatarData(input) {
    // Remove tudo que não é número
    let valor = input.value.replace(/\D/g, '');
    
    // Limita o tamanho para evitar strings muito longas
    valor = valor.substring(0, 8);

    if (valor.length > 4) {
        // Formato DD/MM/AAAA
        valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
        // Formato DD/MM
        valor = valor.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    
    input.value = valor;
}

/**
 * Calcula a data final com base na data inicial e na quantidade de dias.
 * Exibe o resultado ou uma mensagem de erro na página.
 */
function calcularData() {
    // Limpa mensagens anteriores a cada cálculo
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0'); // Esconde o resultado anterior

    const dataValor = dataInputEl.value;
    const diasValor = parseInt(diasInputEl.value, 10);

    // Validação 1: Verifica se os campos estão preenchidos
    if (!dataValor || isNaN(diasValor)) {
        mensagemErroDivEl.textContent = 'Por favor, preencha todos os campos corretamente.';
        return; // Interrompe a função
    }

    // Validação 2: Verifica se a data está no formato correto
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dataValor)) {
        mensagemErroDivEl.textContent = 'Formato de data inválido. Use DD/MM/AAAA.';
        return;
    }

    const [dia, mes, ano] = dataValor.split('/');
    // CORREÇÃO DE BUG: Usa o construtor de Date mais seguro (ano, mês-1, dia)
    const dataInicial = new Date(ano, mes - 1, dia);

    // Validação 3: Verifica se a data criada é válida (ex: 31/02 é inválido)
    if (isNaN(dataInicial.getTime()) || dataInicial.getDate() != dia) {
        mensagemErroDivEl.textContent = 'Data inválida. Verifique o dia e o mês.';
        return;
    }

    // --- Lógica Principal ---
    const dataFinal = new Date(dataInicial);
    dataFinal.setDate(dataInicial.getDate() + diasValor);
    
    const dataAtual = new Date();
    // Zera as horas para comparar apenas as datas
    dataAtual.setHours(0, 0, 0, 0);

    // Formata a data para exibição
    const dataFinalFormatada = dataFinal.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Compara a data final com a data atual
    if (dataFinal < dataAtual) {
        resultadoDivEl.textContent = `A cota está apta para receber em espécie desde ${dataFinalFormatada}.`;
    } else {
        resultadoDivEl.textContent = `A cota estará apta para receber em espécie a partir de ${dataFinalFormatada}.`;
    }
    
    // Revela o resultado com uma animação de fade-in
    resultadoDivEl.classList.remove('opacity-0');
}


// --- "Escutadores" de Eventos ---
// Boa prática: centralizar a atribuição de eventos no JavaScript.
calcularBtnEl.addEventListener('click', calcularData);
dataInputEl.addEventListener('input', () => formatarData(dataInputEl));