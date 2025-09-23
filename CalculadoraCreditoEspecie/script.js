// --- Seleção dos Elementos do DOM ---
const dataInputEl = document.getElementById('data');
const diasInputEl = document.getElementById('dias');
const calcularBtnEl = document.getElementById('calcular-btn');
const resetBtnEl = document.getElementById('reset-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');


// --- Funções ---

/**
 * Formata o input de data para o formato DD/MM/AAAA enquanto o utilizador digita.
 * @param {HTMLInputElement} input O elemento input da data.
 */
function formatarData(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.substring(0, 8);

    if (valor.length > 4) {
        valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    
    input.value = valor;
}

/**
 * Calcula a data final com base na data inicial e na quantidade de dias.
 * Exibe o resultado ou uma mensagem de erro na página.
 */
function calcularData() {
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');

    const dataValor = dataInputEl.value;
    const diasValor = parseInt(diasInputEl.value, 10);

    if (!dataValor || isNaN(diasValor)) {
        mensagemErroDivEl.textContent = 'Por favor, preencha todos os campos corretamente.';
        return;
    }

    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dataValor)) {
        mensagemErroDivEl.textContent = 'Formato de data inválido. Use DD/MM/AAAA.';
        return;
    }

    const [dia, mes, ano] = dataValor.split('/');
    const dataInicial = new Date(ano, mes - 1, dia);

    if (isNaN(dataInicial.getTime()) || dataInicial.getDate() != dia) {
        mensagemErroDivEl.textContent = 'Data inválida. Verifique o dia e o mês.';
        return;
    }

    const dataFinal = new Date(dataInicial);
    dataFinal.setDate(dataInicial.getDate() + diasValor);
    
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const dataFinalFormatada = dataFinal.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    if (dataFinal < dataAtual) {
        resultadoDivEl.textContent = `A cota está apta para receber em espécie desde ${dataFinalFormatada}.`;
    } else {
        resultadoDivEl.textContent = `A cota estará apta para receber em espécie a partir de ${dataFinalFormatada}.`;
    }
    
    resultadoDivEl.classList.remove('opacity-0');
}

/**
 * Limpa todos os campos de entrada e resultados da calculadora.
 */
function resetCalculadora() {
    dataInputEl.value = '';
    diasInputEl.value = '';
    resultadoDivEl.textContent = '';
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');
}


// --- "Escutadores" de Eventos ---
calcularBtnEl.addEventListener('click', calcularData);
resetBtnEl.addEventListener('click', resetCalculadora);
dataInputEl.addEventListener('input', () => formatarData(dataInputEl));