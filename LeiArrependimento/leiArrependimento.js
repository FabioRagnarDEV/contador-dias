// --- Seleção dos Elementos do DOM ---
const dataPagamentoInput = document.getElementById('data-pagamento');
const calcularBtn = document.getElementById('calcular-btn');
const zerarBtn = document.getElementById('zerar-btn');
const resultadoDiv = document.getElementById('resultado');
const mensagemErroDiv = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');
// --- NOVOS ELEMENTOS ---
const contagemBtn = document.getElementById('contagem-btn');
const contagemResultadoDiv = document.getElementById('contagem-resultado');


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
    // --- NOVO: Esconde a contagem ao zerar ---
    contagemResultadoDiv.classList.add('hidden');
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
    contagemResultadoDiv.classList.add('hidden'); // Esconde contagem antiga
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

/**
 * --- NOVA FUNÇÃO ---
 * Mostra a contagem detalhada dos 7 dias.
 */
function mostrarContagem() {
    const dataPagamentoValor = dataPagamentoInput.value;
    if (!dataPagamentoValor || dataPagamentoValor.length < 10) {
        mensagemErroDiv.textContent = 'Insira uma data válida primeiro para ver a contagem.';
        return;
    }
    
    const [dia, mes, ano] = dataPagamentoValor.split('/');
    const dataPagamento = new Date(ano, mes - 1, dia);

    if (isNaN(dataPagamento.getTime()) || dataPagamento.getDate() != dia) {
        mensagemErroDiv.textContent = 'Data inválida. Verifique o dia e o mês.';
        return;
    }

    let contagemHTML = '<h4 class="font-bold mb-2">Contagem do Prazo:</h4><ul class="space-y-1 text-sm">';
    
    for (let i = 0; i < 7; i++) {
        const dataDia = new Date(dataPagamento);
        dataDia.setDate(dataPagamento.getDate() + i);
        const diaFormatado = dataDia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

        if (i < 6) {
            contagemHTML += `<li><strong>Dia ${i + 1}:</strong> ${diaFormatado}</li>`;
        } else {
            // Destaque para o último dia
            contagemHTML += `<li class="font-bold text-base mt-2"><strong>Dia ${i + 1} (Prazo Final):</strong> ${diaFormatado}</li>`;
        }
    }
    
    contagemHTML += '</ul>';
    
    contagemResultadoDiv.innerHTML = contagemHTML;
    contagemResultadoDiv.classList.remove('hidden');
}


// --- "Escutadores" de Eventos ---
calcularBtn.addEventListener('click', calcularPrazo);
zerarBtn.addEventListener('click', zerarCalculadora);
dataPagamentoInput.addEventListener('input', () => formatarData(dataPagamentoInput));

contagemBtn.addEventListener('click', mostrarContagem);