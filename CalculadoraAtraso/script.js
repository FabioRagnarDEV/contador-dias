// --- Seleção dos Elementos do DOM ---
const statusNaoContempladoRadio = document.getElementById('status-nao-contemplado');
const statusContempladoRadio = document.getElementById('status-contemplado');
const detalhesNaoContempladoDiv = document.getElementById('detalhes-nao-contemplado');
const dataVencimentoInput = document.getElementById('data-vencimento');
const numeroParcelasInput = document.getElementById('numero-parcelas');
const calcularBtn = document.getElementById('calcular-btn');
const resetBtn = document.getElementById('reset-btn');
const resultadoDiv = document.getElementById('resultado');
const mensagemErroDiv = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal'); // <-- Novo
const regrasConteudoDiv = document.getElementById('regras-conteudo'); // <-- Novo
const manualConteudoDiv = document.getElementById('manual-conteudo'); // <-- Novo


// --- Conteúdo Dinâmico (GUIAS E REGRAS) ---

const manualDeUso = `
    <div>
        <h4 class="text-xl font-bold text-slate-800 border-b pb-2 mb-3">Como Usar a Ferramenta</h4>
        <p class="mb-4">Esta calculadora analisa o risco de uma cota com base em dois cenários principais. Siga os passos para obter um diagnóstico preciso:</p>
        
        <div class="space-y-4">
            <div>
                <h5 class="font-semibold text-slate-800">Cenário 1: Não Contemplado / Crédito Pendente</h5>
                <ul class="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Marque a opção <strong>"Não Contemplado / Crédito Pendente"</strong>.</li>
                    <li>Selecione <strong>"Administradora"</strong> (Ex: Embracon, CNVW).</li>
                    <li>Informe a <strong>"Data de Inauguração do Grupo"</strong> (antes ou depois de Jul/2024).</li>
                    <li>Preencha o <strong>"Vencimento da Parcela Mais Antiga"</strong> e o <strong>"Nº de Parcelas em Aberto"</strong>.</li>
                    <li>Clique em <strong>"Analisar"</strong>. O sistema verificará se a cota atingiu os critérios para risco de cancelamento automático.</li>
                </ul>
            </div>
            <div>
                <h5 class="font-semibold text-slate-800">Cenário 2: Contemplado (Bem Entregue)</h5>
                <ul class="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Marque a opção <strong>"Contemplado (Bem Entregue)"</strong>.</li>
                    <li>Preencha o <strong>"Vencimento da Parcela Mais Antiga"</strong> e o <strong>"Nº de Parcelas em Aberto"</strong>.</li>
                    <li>Clique em <strong>"Analisar"</strong>. O sistema mostrará em qual fase da régua de cobrança o consorciado se encontra, desde a negativação até o risco de apreensão do bem.</li>
                </ul>
            </div>
        </div>
    </div>
`;

const sinteseDasRegras = `
    <div class="bg-blue-50 text-blue-800 p-4 rounded-lg">
        <h5 class="font-bold mb-2">Não Contemplado / Crédito Pendente</h5>
        <p class="text-sm">O risco de cancelamento automático ocorre quando o número de parcelas em atraso ou a quantidade de dias corridos da parcela mais antiga atinge o limite, que varia conforme o tipo e a data de inauguração do grupo.</p>
        <ul class="list-disc list-inside text-xs space-y-1 mt-2">
            <li><strong>Grupos Embracon/Renault (até 30/06/24):</strong> 2 parcelas ou 42 dias.</li>
            <li><strong>Grupos Stara/Unicred/Cresol (até 30/06/24):</strong> 4 parcelas ou 99 dias.</li>
            <li><strong>Qualquer grupo (após 01/07/24):</strong> 3 parcelas ou 62 dias.</li>
        </ul>
    </div>
    <div class="bg-orange-50 text-orange-800 p-4 rounded-lg">
        <h5 class="font-bold mb-2">Contemplado (Bem Entregue) - Régua de Cobrança</h5>
        <p class="text-sm">Para clientes que já receberam o bem, o processo de cobrança segue uma régua de tempo baseada em dias corridos de atraso da parcela mais antiga.</p>
        <ul class="list-disc list-inside text-xs space-y-1 mt-2">
            <li><strong>10 dias:</strong> Envio para negativação.</li>
            <li><strong>16 dias:</strong> Início da cobrança amigável (Assessoria).</li>
            <li><strong>60 dias:</strong> Envio de notificação pela assessoria.</li>
            <li><strong>80 dias:</strong> Notificação cartorial.</li>
            <li><strong>135 dias:</strong> Início do ajuizamento da ação.</li>
            <li><strong>200 dias (Bem Móvel):</strong> Risco de apreensão do bem.</li>
        </ul>
    </div>
`;

// --- Funções Auxiliares ---

function formatarData(input) {
    let valor = input.value.replace(/\D/g, '').substring(0, 8);
    if (valor.length > 4) {
        valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    input.value = valor;
}

function parseDate(dateString) {
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dateString)) return null;
    const [dia, mes, ano] = dateString.split('/');
    const data = new Date(ano, mes - 1, dia);
    return (isNaN(data.getTime()) || data.getDate() != dia) ? null : data;
}

function calcularDiasAtraso(dataVencimento) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataVencimento >= hoje) return 0;
    const diffTime = hoje - dataVencimento;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- Lógica Principal ---

function analisarAtraso() {
    mensagemErroDiv.textContent = '';
    resultadoDiv.className = 'text-center text-lg p-4 rounded-lg transition-opacity duration-300 opacity-0';
    infoLegalDiv.classList.add('hidden'); // Esconde as regras antes de um novo cálculo

    const dataVencimento = parseDate(dataVencimentoInput.value);
    if (!dataVencimento) {
        mensagemErroDiv.textContent = 'Por favor, insira uma data de vencimento válida.';
        return;
    }

    const parcelasAbertas = parseInt(numeroParcelasInput.value, 10) || 0;
    if (parcelasAbertas <= 0) {
        mensagemErroDiv.textContent = 'Informe o número de parcelas em aberto.';
        return;
    }

    const diasAtraso = calcularDiasAtraso(dataVencimento);
    let statusFinal = '';
    let corFundo = '';
    let corTexto = '';

    if (statusNaoContempladoRadio.checked) {
        const tipoGrupo = document.querySelector('input[name="tipo-grupo"]:checked').value;
        const dataInauguracao = document.querySelector('input[name="data-inauguracao"]:checked').value;
        let parcelasParaCancelar = 0;
        let diasParaCancelar = 0;

        if (dataInauguracao === 'apos-jul24') {
            parcelasParaCancelar = 3;
            diasParaCancelar = 62;
        } else { 
            switch (tipoGrupo) {
                case 'embracon-renault':
                    parcelasParaCancelar = 2;
                    diasParaCancelar = 42;
                    break;
                case 'cnvw':
                    parcelasParaCancelar = 3;
                    diasParaCancelar = 62; 
                    break;
                case 'stara-cresol':
                    parcelasParaCancelar = 4;
                    diasParaCancelar = 99;
                    break;
            }
        }
        
        const infoCota = `(${diasAtraso} dias | ${parcelasAbertas} parcelas)`;
        
        if (parcelasAbertas >= parcelasParaCancelar || diasAtraso >= diasParaCancelar) {
            statusFinal = `<strong>ALERTA DE CANCELAMENTO ${infoCota}:</strong> A cota atingiu o critério de ${parcelasParaCancelar} parcelas ou ${diasParaCancelar} dias e poderá ser cancelada automaticamente a qualquer momento.`;
            corFundo = 'bg-red-100';
            corTexto = 'text-red-800';
        } else {
            statusFinal = `<strong>Status ${infoCota}:</strong> A cota está em atraso, mas ainda não atingiu o critério (${parcelasParaCancelar} parcelas ou ${diasParaCancelar} dias) para o alerta de cancelamento. Estando dentro das regras, sugerir diluição.`;
            corFundo = 'bg-yellow-100';
            corTexto = 'text-yellow-800';
        }

    } else if (statusContempladoRadio.checked) {
        const parcelasInfo = `${parcelasAbertas} parcela(s) em aberto`;

        if (diasAtraso >= 200) {
            statusFinal = `<strong>FASE 5 - APREENSÃO (${diasAtraso} dias | ${parcelasInfo}):</strong> O processo de apreensão do bem pode ser iniciado.`;
            corFundo = 'bg-red-900'; corTexto = 'text-white';
        } else if (diasAtraso >= 150) {
            statusFinal = `<strong>FASE 4 - JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Prazo fatal para a distribuição da ação judicial de cobrança.`;
            corFundo = 'bg-red-700'; corTexto = 'text-white';
        } else if (diasAtraso >= 135) {
            statusFinal = `<strong>FASE 4 - JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Início do processo de ajuizamento da ação de cobrança.`;
            corFundo = 'bg-red-500'; corTexto = 'text-white';
        } else if (diasAtraso >= 105) {
            statusFinal = `<strong>FASE 3 - PRÉ-JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Análise do resultado da notificação cartorial.`;
            corFundo = 'bg-red-300'; corTexto = 'text-red-900';
        } else if (diasAtraso >= 100) {
            statusFinal = `<strong>FASE 3 - PRÉ-JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Preparação dos documentos para ajuizamento da ação.`;
            corFundo = 'bg-red-200'; corTexto = 'text-red-800';
        } else if (diasAtraso >= 80) {
            statusFinal = `<strong>FASE 3 - PRÉ-JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Envio de notificação cartorial.`;
            corFundo = 'bg-orange-300'; corTexto = 'text-orange-900';
        } else if (diasAtraso >= 60) {
            statusFinal = `<strong>FASE 3 - PRÉ-JURÍDICO (${diasAtraso} dias | ${parcelasInfo}):</strong> Envio de notificação de cobrança pela assessoria.`;
            corFundo = 'bg-orange-200'; corTexto = 'text-orange-800';
        } else if (diasAtraso >= 16) {
            statusFinal = `<strong>FASE 2 - COBRANÇA AMIGÁVEL (${diasAtraso} dias | ${parcelasInfo}):</strong> Início da cobrança amigável pela assessoria.`;
            corFundo = 'bg-yellow-200'; corTexto = 'text-yellow-800';
        } else if (diasAtraso >= 10) {
            statusFinal = `<strong>FASE 1 - NEGATIVAÇÃO (${diasAtraso} dias | ${parcelasInfo}):</strong> Cota enviada para negativação no serviço de proteção ao crédito.`;
            corFundo = 'bg-yellow-100'; corTexto = 'text-yellow-700';
        } else if (diasAtraso > 0) {
             statusFinal = `<strong>Status (${diasAtraso} dias | ${parcelasInfo}):</strong> Cota em atraso. Com 10 dias será enviada para negativação.`;
             corFundo = 'bg-blue-100'; corTexto = 'text-blue-800';
        } else {
             statusFinal = `<strong>Status:</strong> A parcela não está em atraso.`;
             corFundo = 'bg-green-100'; corTexto = 'text-green-800';
        }
    }
    
    resultadoDiv.innerHTML = statusFinal;
    resultadoDiv.classList.add(corFundo, corTexto);
    resultadoDiv.classList.remove('opacity-0');
    infoLegalDiv.classList.remove('hidden'); // Mostra a seção de regras com o resultado
}

function resetarCalculadora() {
    dataVencimentoInput.value = '';
    numeroParcelasInput.value = '';
    mensagemErroDiv.textContent = '';
    resultadoDiv.textContent = '';
    resultadoDiv.classList.add('opacity-0');
    infoLegalDiv.classList.add('hidden'); // Garante que as regras fiquem ocultas
    statusNaoContempladoRadio.checked = true;
    detalhesNaoContempladoDiv.classList.remove('hidden');
    document.getElementById('grupo-embracon').checked = true;
    document.getElementById('data-ate-jun24').checked = true;
}

// --- "Escutadores" de Eventos ---
document.querySelectorAll('input[name="status-consorciado"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.value === 'nao-contemplado') {
            detalhesNaoContempladoDiv.classList.remove('hidden');
        } else {
            detalhesNaoContempladoDiv.classList.add('hidden');
        }
    });
});

calcularBtn.addEventListener('click', analisarAtraso);
resetBtn.addEventListener('click', resetarCalculadora);
dataVencimentoInput.addEventListener('input', () => formatarData(dataVencimentoInput));

// --- Inicialização da Página ---
function inicializar() {
    manualConteudoDiv.innerHTML = manualDeUso;
    regrasConteudoDiv.innerHTML = sinteseDasRegras;
    resetarCalculadora();
}

inicializar();