// --- Seleção dos Elementos do DOM ---
const dataInputEl = document.getElementById('data');
const calcularBtnEl = document.getElementById('calcular-btn');
const resetBtnEl = document.getElementById('reset-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal'); // Novo elemento

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
 * Calcula a data final (180 dias) com base na data da contemplação.
 */
function calcularData() {
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden'); // Esconde a info ao calcular novamente

    const dataValor = dataInputEl.value;

    // Validação simplificada, pois não há mais campo de dias
    if (!dataValor || dataValor.length < 10) {
        mensagemErroDivEl.textContent = 'Por favor, insira a data da contemplação.';
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
    // Lógica agora usa o valor fixo de 180 dias
    dataFinal.setDate(dataInicial.getDate() + 180);
    
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const dataFinalFormatada = dataFinal.toLocaleDateString('pt-BR');

    if (dataFinal < dataAtual) {
        resultadoDivEl.textContent = `A cota está apta para receber em espécie desde ${dataFinalFormatada}.`;
    } else {
        resultadoDivEl.textContent = `A cota estará apta para receber em espécie a partir de ${dataFinalFormatada}.`;
    }
    
    resultadoDivEl.classList.remove('opacity-0');
    infoLegalDiv.classList.remove('hidden'); // Mostra a info legal após o cálculo
}

/**
 * Limpa todos os campos de entrada e resultados da calculadora.
 */
function resetCalculadora() {
    dataInputEl.value = '';
    resultadoDivEl.textContent = '';
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden'); // Garante que a info legal seja escondida ao zerar
}


// --- "Escutadores" de Eventos ---
calcularBtnEl.addEventListener('click', calcularData);
resetBtnEl.addEventListener('click', resetCalculadora);
dataInputEl.addEventListener('input', () => formatarData(dataInputEl));