// --- Seleção dos Elementos do DOM ---
const dataContemplacaoInput = document.getElementById('data-contemplacao');
const grupoEncerradoCheck = document.getElementById('grupo-encerrado-check');
const encerramentoContainer = document.getElementById('encerramento-container');
const dataEncerramentoInput = document.getElementById('data-encerramento');
const calcularBtnEl = document.getElementById('calcular-btn');
const resetBtnEl = document.getElementById('reset-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');

// --- Funções Auxiliares ---

/**
 * Formata um input de data para o formato DD/MM/AAAA.
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
 * Converte uma string DD/MM/AAAA para um objeto Date. Retorna null se for inválida.
 */
function parseDate(dateString) {
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dateString)) return null;

    const [dia, mes, ano] = dateString.split('/');
    const data = new Date(ano, mes - 1, dia);

    if (isNaN(data.getTime()) || data.getDate() != dia) return null;
    
    return data;
}


// --- Funções Principais ---

/**
 * Limpa todos os campos e resultados da calculadora.
 */
function resetCalculadora() {
    dataContemplacaoInput.value = '';
    dataEncerramentoInput.value = '';
    grupoEncerradoCheck.checked = false;
    encerramentoContainer.classList.add('hidden');
    resultadoDivEl.textContent = '';
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden');
    resultadoDivEl.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
}

/**
 * Calcula o prazo para recebimento do crédito em espécie.
 */
function calcularData() {
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = '';
    resultadoDivEl.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden');
    resultadoDivEl.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

    const dataContemplacao = parseDate(dataContemplacaoInput.value);
    if (!dataContemplacao) {
        mensagemErroDivEl.textContent = 'Por favor, insira uma data de contemplação válida.';
        return;
    }

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    // Cenário 1: O grupo encerrou
    if (grupoEncerradoCheck.checked) {
        const dataEncerramento = parseDate(dataEncerramentoInput.value);
        if (!dataEncerramento) {
            mensagemErroDivEl.textContent = 'Por favor, insira uma data de encerramento de grupo válida.';
            return;
        }

        if (dataAtual >= dataEncerramento) {
            resultadoDivEl.innerHTML = `✅ <span class="font-bold">SIM, pode receber imediatamente.</span><br>O grupo já encerrou, dispensando o prazo de 180 dias.`;
            resultadoDivEl.classList.add('bg-green-100', 'text-green-800');
        } else {
            resultadoDivEl.innerHTML = `ℹ️ <span class="font-bold">O grupo ainda não encerrou.</span><br>A data de encerramento é futura. A regra de 180 dias ainda se aplica.`;
            resultadoDivEl.classList.add('bg-yellow-100', 'text-yellow-800');
        }
    
    // Cenário 2: O grupo está ativo (regra padrão de 180 dias)
    } else {
        const dataFinal = new Date(dataContemplacao);
        dataFinal.setDate(dataContemplacao.getDate() + 180);
        
        const dataFinalFormatada = dataFinal.toLocaleDateString('pt-BR');

        if (dataFinal < dataAtual) {
            resultadoDivEl.innerHTML = `✅ <span class="font-bold">SIM, está apto para receber.</span><br>O prazo de 180 dias foi cumprido em ${dataFinalFormatada}.`;
            resultadoDivEl.classList.add('bg-green-100', 'text-green-800');
        } else {
            resultadoDivEl.innerHTML = `❌ <span class="font-bold">NÃO, ainda não cumpriu o prazo.</span><br>Estará apto para receber a partir de ${dataFinalFormatada}.`;
            resultadoDivEl.classList.add('bg-red-100', 'text-red-800');
        }
    }
    
    resultadoDivEl.classList.remove('opacity-0');
    infoLegalDiv.classList.remove('hidden');
}


// --- "Escutadores" de Eventos ---

// Mostra/esconde o campo de data de encerramento
grupoEncerradoCheck.addEventListener('change', () => {
    encerramentoContainer.classList.toggle('hidden');
});

calcularBtnEl.addEventListener('click', calcularData);
resetBtnEl.addEventListener('click', resetCalculadora);
dataContemplacaoInput.addEventListener('input', () => formatarData(dataContemplacaoInput));
dataEncerramentoInput.addEventListener('input', () => formatarData(dataEncerramentoInput));