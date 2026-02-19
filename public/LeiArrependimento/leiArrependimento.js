// --- Seleção dos Elementos do DOM ---
const dataPagamentoInput = document.getElementById('data-pagamento');
const calcularBtn = document.getElementById('calcular-btn');
const zerarBtn = document.getElementById('zerar-btn');
const resultadoDiv = document.getElementById('resultado');
const mensagemErroDiv = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');
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
    contagemResultadoDiv.classList.add('hidden');
    resultadoDiv.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
}

/**
 * Calcula se a data atual está dentro do prazo de 7 dias a partir da data do pagamento.
 * --- MODIFICADO: Inclui a verificação de fim de semana no 7º dia. ---
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

    // Calcula o prazo final (Dia 1 + 6 dias = Dia 7)
    const prazoFinal = new Date(dataPagamento);
    prazoFinal.setDate(dataPagamento.getDate() + 6);

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);
    
    const prazoFinalFormatado = prazoFinal.toLocaleDateString('pt-BR');
    const prazoFinalCompleto = prazoFinalFormatado + ' às 23:59';

    // --- INÍCIO DA NOVA VALIDAÇÃO (REGRA INTERNA) ---
    let avisoFimDeSemana = '';
    // .getDay() retorna 0 para Domingo e 6 para Sábado
    const diaDaSemana = prazoFinal.getDay(); 

    if (diaDaSemana === 6) { // Se for Sábado
        avisoFimDeSemana = `<br><br><strong class="text-amber-700">Atenção:</strong> O dia ${prazoFinalFormatado} é um <strong>Sábado</strong>. Favor verificar com seu líder/madrinha imediata para verificar exceção.`;
    } else if (diaDaSemana === 0) { // Se for Domingo
        avisoFimDeSemana = `<br><br><strong class="text-amber-700">Atenção:</strong> O dia ${prazoFinalFormatado} é um <strong>Domingo</strong>. Favor verificar com seu líder/madrinha imediata para verificar exceção.`;
    }
    // --- FIM DA NOVA VALIDAÇÃO ---

    // Exibe o resultado, agora concatenando o aviso (se houver)
    if (dataAtual <= prazoFinal) {
        resultadoDiv.innerHTML = `✅ <span class="font-bold">SIM, está no prazo.</span><br>O direito de arrependimento expira em ${prazoFinalCompleto}.${avisoFimDeSemana}`;
        resultadoDiv.classList.add('bg-green-100', 'text-green-800');
    } else {
        resultadoDiv.innerHTML = `❌ <span class="font-bold">NÃO, o prazo expirou.</span><br>O período de 7 dias terminou em ${prazoFinalCompleto}.${avisoFimDeSemana}`;
        resultadoDiv.classList.add('bg-red-100', 'text-red-800');
    }

    resultadoDiv.classList.remove('opacity-0');
    infoLegalDiv.classList.remove('hidden');
}

/**
 * 
 * Mostra a contagem detalhada dos 7 dias, destacando se o último dia é fim de semana.
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
            // --- INÍCIO DA NOVA VALIDAÇÃO (DIA 7) ---
            const diaDaSemana = dataDia.getDay(); // 0 = Domingo, 6 = Sábado
            let avisoExtra = '';

            if (diaDaSemana === 6) {
                avisoExtra = ' (Sábado)';
            } else if (diaDaSemana === 0) {
                avisoExtra = ' (Domingo)';
            }
            // --- FIM DA NOVA VALIDAÇÃO ---
            
            
            contagemHTML += `<li class="font-bold text-base mt-2"><strong>Dia ${i + 1} (Prazo Final):</strong> ${diaFormatado}<strong class="text-amber-700">${avisoExtra}</strong></li>`;
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

// Listener do novo botão
contagemBtn.addEventListener('click', mostrarContagem);