// --- Seleção dos Elementos do DOM ---
const dataPagamentoInput = document.getElementById('data-pagamento');
const calcularBtn = document.getElementById('calcular-btn');
const zerarBtn = document.getElementById('zerar-btn');
const resultadoDiv = document.getElementById('resultado');
const mensagemErroDiv = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');


// --- Funções Auxiliares ---

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

// --- Funções Principais ---

/**
 * Zera todos os campos da calculadora.
 */
function zerarCalculadora() {
    dataPagamentoInput.value = '';
    resultadoDiv.textContent = '';
    mensagemErroDiv.textContent = '';
    resultadoDiv.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden');
    resultadoDiv.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
}

/**
 * Calcula se a data atual está dentro do prazo de 7 dias a partir da data do pagamento.
 */
function calcularPrazo() {
    mensagemErroDiv.textContent = '';
    resultadoDiv.textContent = '';
    resultadoDiv.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden');
    resultadoDiv.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

    const dataPagamentoValor = dataPagamentoInput.value;
    if (!dataPagamentoValor || dataPagamentoValor.length < 10) {
        mensagemErroDiv.textContent = 'Por favor, insira a data do pagamento no formato DD/MM/AAAA.';
        return;
    }

    const [dia, mes, ano] = dataPagamentoValor.split('/');
    const dataPagamento = new Date(ano, mes - 1, dia);

    if (isNaN(dataPagamento.getTime()) || dataPagamento.getDate() != dia) {
        mensagemErroDiv.textContent = 'Data inválida. Verifique o dia e o mês.';
        return;
    }

    const prazoFinal = new Date(dataPagamento);
    prazoFinal.setDate(dataPagamento.getDate() + 6);

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);
    
    // CORREÇÃO: Formata a data e adiciona o horário manualmente para clareza.
    const prazoFinalFormatado = prazoFinal.toLocaleDateString('pt-BR') + ' às 23:59';

    if (dataAtual <= prazoFinal) {
        resultadoDiv.innerHTML = `✅ <span class="font-bold">SIM, está no prazo.</span><br>O direito de arrependimento expira em ${prazoFinalFormatado}.`;
        resultadoDiv.classList.add('bg-green-100', 'text-green-800');
    } else {
        resultadoDiv.innerHTML = `❌ <span class="font-bold">NÃO, o prazo expirou.</span><br>O período de 7 dias terminou em ${prazoFinalFormatado}.`;
        resultadoDiv.classList.add('bg-red-100', 'text-red-800');
    }

    resultadoDiv.classList.remove('opacity-0');
    infoLegalDiv.classList.remove('hidden');
}


// --- "Escutadores" de Eventos ---
calcularBtn.addEventListener('click', calcularPrazo);
zerarBtn.addEventListener('click', zerarCalculadora);
dataPagamentoInput.addEventListener('input', () => formatarData(dataPagamentoInput));