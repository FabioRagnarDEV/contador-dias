// --- Estado da Aplicação ---
let feriadosPorAno = {}; // Armazena os feriados para evitar chamadas repetidas à API

// --- Elementos do DOM ---
// Seções
const pvdSection = document.getElementById('pvd');
const cpvSection = document.getElementById('cpv');
const dvSection = document.getElementById('dv'); // NOVO

// PVD (Pós Vendas Digital)
const dataEfetivacaoInput = document.getElementById('dataEfetivacao');
const resultadoPVDDiv = document.getElementById('resultadoPVD');
const erroPVDDiv = document.getElementById('erroPVD');

// CPV (Caso Pós Vendas)
const dataAberturaInput = document.getElementById('dataAbertura');
const numeroCasoInput = document.getElementById('numeroCaso');
const resultadoCPVDiv = document.getElementById('resultadoCPV');
const erroCPVDiv = document.getElementById('erroCPV');

// DV (Divergência na Venda) - NOVO
const dataAberturaDVInput = document.getElementById('dataAberturaDV');
const numeroCasoDVInput = document.getElementById('numeroCasoDV');
const resultadoDVDiv = document.getElementById('resultadoDV');
const erroDVDiv = document.getElementById('erroDV');


// --- Funções de Ajuda (Helpers) ---

/**
 * Carrega e armazena os feriados de um ano específico via BrasilAPI.
 */
async function carregarFeriados(ano) {
    if (feriadosPorAno[ano]) {
        return; 
    }
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (!response.ok) throw new Error('Falha na resposta da API');
        const data = await response.json();
        feriadosPorAno[ano] = data.map(f => f.date); 
    } catch (error) {
        console.error("Erro ao carregar feriados:", error);
        erroPVDDiv.textContent = "Erro ao carregar feriados. Verifique a conexão.";
        erroCPVDiv.textContent = "Erro ao carregar feriados. Verifique a conexão.";
    }
}

/**
 * Verifica se uma data é um feriado.
 */
function isFeriado(date) {
    const ano = date.getFullYear();
    if (!feriadosPorAno[ano]) return false;
    const dataFormatada = date.toISOString().split('T')[0];
    return feriadosPorAno[ano].includes(dataFormatada);
}

/**
 * Verifica se uma data cai em um fim de semana.
 */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

/**
 * Adiciona dias úteis.
 */
function addBusinessDays(startDate, days) {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (!isWeekend(currentDate) && !isFeriado(currentDate)) {
            addedDays++;
        }
    }
    return currentDate;
}

/**
 * Conta dias úteis.
 */
function countBusinessDays(startDate, endDate) {
    let count = 0;
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        if (!isWeekend(currentDate) && !isFeriado(currentDate)) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
}


// --- Funções de Lógica Principal ---

/**
 * Processa a verificação do Pós Vendas Digital.
 */
async function processPVD() {
    erroPVDDiv.textContent = '';
    resultadoPVDDiv.textContent = '';
    resultadoPVDDiv.classList.add('hidden'); // Esconde ao iniciar

    const efetivacaoValue = dataEfetivacaoInput.value;
    if (!efetivacaoValue) {
        erroPVDDiv.textContent = "Por favor, informe a data da efetivação.";
        return;
    }

    const dataEfetivacao = new Date(efetivacaoValue);
    await carregarFeriados(dataEfetivacao.getFullYear());

    const prazoFinal = addBusinessDays(dataEfetivacao, 2);
    const dataAtual = new Date();
    
    // Zera horas para comparação justa de datas
    dataAtual.setHours(0,0,0,0);
    prazoFinal.setHours(0,0,0,0);

    resultadoPVDDiv.classList.remove('hidden'); // Mostra resultado

    if (dataAtual > prazoFinal) {
        resultadoPVDDiv.textContent = "Prazo de 48h úteis excedido. Abrir vermelha comercial para a ouvidoria.";
        resultadoPVDDiv.classList.remove('text-green-800', 'bg-green-100');
        resultadoPVDDiv.classList.add('text-red-800', 'bg-red-100');
    } else {
        resultadoPVDDiv.textContent = "Dentro do prazo de 48h úteis. Direcione ou chame alguém do pós vendas imediatamente para fazer contato com o consorciado.";
        resultadoPVDDiv.classList.remove('text-red-800', 'bg-red-100');
        resultadoPVDDiv.classList.add('text-green-800', 'bg-green-100');
    }
}

/**
 * Processa a verificação do Caso Pós Vendas.
 */
async function processCPV() {
    erroCPVDiv.textContent = '';
    resultadoCPVDiv.textContent = '';
    resultadoCPVDiv.classList.add('hidden');

    const dataAberturaValue = dataAberturaInput.value;
    const numeroCasoValue = numeroCasoInput.value;

    if (!dataAberturaValue || !numeroCasoValue) {
        erroCPVDiv.textContent = "Por favor, preencha todos os campos.";
        return;
    }
    
    const dataAbertura = new Date(dataAberturaValue);
    const dataAtual = new Date();
    dataAtual.setHours(0,0,0,0); // Zera horas para evitar erros de fuso/hora
    
    await carregarFeriados(dataAbertura.getFullYear());
    await carregarFeriados(dataAtual.getFullYear());

    const diffBusinessDays = countBusinessDays(dataAbertura, dataAtual);
    const prazoTotal = 50;

    resultadoCPVDiv.classList.remove('hidden');

    if (diffBusinessDays > prazoTotal) {
        resultadoCPVDiv.textContent = `${prazoTotal} dias úteis excedidos. Abrir um caso de vermelha comercial e anexar as evidências se já os tiver`;
        resultadoCPVDiv.classList.add('text-red-800', 'bg-red-100');
    } else {
        const diasRestantes = prazoTotal - diffBusinessDays;
        const verbo = diasRestantes === 1 ? "resta" : "restam";
        const plural = diasRestantes === 1 ? "dia útil" : "dias úteis";
        resultadoCPVDiv.textContent = `Para o caso ${numeroCasoValue}, ${verbo} ${diasRestantes} ${plural} para tratativa. Abrir caso de dúvida para a fila do setor 'Pós-Vendas'.`;
        resultadoCPVDiv.classList.remove('text-red-800', 'bg-red-100');
    }
}

/**
 * Processa a verificação de Divergência na Venda (NOVO).
 * Lógica: 90 dias CORRIDOS (conta sábado, domingo e feriado).
 */
function processDV() {
    erroDVDiv.textContent = '';
    resultadoDVDiv.textContent = '';
    resultadoDVDiv.classList.add('hidden');

    const dataAberturaValue = dataAberturaDVInput.value;
    const numeroCasoValue = numeroCasoDVInput.value;

    if (!dataAberturaValue || !numeroCasoValue) {
        erroDVDiv.textContent = "Por favor, preencha todos os campos.";
        return;
    }

    const dataAbertura = new Date(dataAberturaValue);
    const dataAtual = new Date();
    
    // Zera as horas para comparar apenas datas
    dataAbertura.setHours(0,0,0,0);
    dataAtual.setHours(0,0,0,0);

    if (dataAbertura > dataAtual) {
        erroDVDiv.textContent = "A data de abertura não pode ser no futuro.";
        return;
    }

    // Calcula prazo de 90 dias corridos
    const dataLimite = new Date(dataAbertura);
    dataLimite.setDate(dataLimite.getDate() + 90);

    // Diferença em milissegundos convertida para dias
    const diferencaTempo = dataLimite - dataAtual;
    const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    resultadoDVDiv.classList.remove('hidden');

    if (diasRestantes >= 0) {
        // DENTRO DO PRAZO
        resultadoDVDiv.innerHTML = `Para o caso ${numeroCasoValue} ainda restam ${diasRestantes} dias para tratativa.<br><br>Por favor, acionar o pós vendas imediatamente para tratativa, pois está dentro do prazo de tratativa`;
        // Remove cores de erro caso existam
        resultadoDVDiv.classList.remove('text-red-800', 'bg-red-100');
    } else {
        // FORA DO PRAZO (EXPIRADO)
        const diasExpirados = Math.abs(diasRestantes);
        resultadoDVDiv.textContent = `Para o caso ${numeroCasoValue}, o prazo de 90 dias corridos expirou há ${diasExpirados} dias.`;
        resultadoDVDiv.classList.add('text-red-800', 'bg-red-100');
    }
}


// --- Funções de UI ---

function showSection(sectionId) {
    // Esconde todas as seções
    pvdSection.classList.add('hidden');
    cpvSection.classList.add('hidden');
    dvSection.classList.add('hidden'); // NOVO

    // Mostra a escolhida
    document.getElementById(sectionId).classList.remove('hidden');
    
    // Opcional: Limpar erros ao trocar de aba
    erroPVDDiv.textContent = '';
    erroCPVDiv.textContent = '';
    erroDVDiv.textContent = '';
    
    // Esconder resultados antigos
    resultadoPVDDiv.classList.add('hidden');
    resultadoCPVDiv.classList.add('hidden');
    resultadoDVDiv.classList.add('hidden');
}

function resetPVD() {
    dataEfetivacaoInput.value = '';
    resultadoPVDDiv.textContent = '';
    resultadoPVDDiv.classList.add('hidden');
    erroPVDDiv.textContent = '';
}

function resetCPV() {
    dataAberturaInput.value = '';
    numeroCasoInput.value = '';
    resultadoCPVDiv.textContent = '';
    resultadoCPVDiv.classList.add('hidden');
    erroCPVDiv.textContent = '';
}

// NOVO Reset para Divergência
function resetDV() {
    dataAberturaDVInput.value = '';
    numeroCasoDVInput.value = '';
    resultadoDVDiv.textContent = '';
    resultadoDVDiv.classList.add('hidden');
    erroDVDiv.textContent = '';
}


// --- "Escutadores" de Eventos (Event Listeners) ---

// Botões de Navegação (Abas)
document.getElementById('btn-show-pvd').addEventListener('click', () => showSection('pvd'));
document.getElementById('btn-show-cpv').addEventListener('click', () => showSection('cpv'));
document.getElementById('btn-show-dv').addEventListener('click', () => showSection('dv')); // NOVO

// Ações PVD
document.getElementById('btn-process-pvd').addEventListener('click', processPVD);
document.getElementById('btn-reset-pvd').addEventListener('click', resetPVD);

// Ações CPV
document.getElementById('btn-process-cpv').addEventListener('click', processCPV);
document.getElementById('btn-reset-cpv').addEventListener('click', resetCPV);

// Ações DV (NOVO)
document.getElementById('btn-process-dv').addEventListener('click', processDV);
document.getElementById('btn-reset-dv').addEventListener('click', resetDV);

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    const anoAtual = new Date().getFullYear();
    carregarFeriados(anoAtual);
});