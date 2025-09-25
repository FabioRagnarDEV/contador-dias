// --- Estado da Aplicação ---
let feriadosPorAno = {}; // Armazena os feriados para evitar chamadas repetidas à API

// --- Elementos do DOM ---
const pvdSection = document.getElementById('pvd');
const cpvSection = document.getElementById('cpv');
// PVD
const dataEfetivacaoInput = document.getElementById('dataEfetivacao');
const resultadoPVDDiv = document.getElementById('resultadoPVD');
const erroPVDDiv = document.getElementById('erroPVD');
// CPV
const dataAberturaInput = document.getElementById('dataAbertura');
const numeroCasoInput = document.getElementById('numeroCaso');
const resultadoCPVDiv = document.getElementById('resultadoCPV');
const erroCPVDiv = document.getElementById('erroCPV');


// --- Funções de Ajuda (Helpers) ---

/**
 * Carrega e armazena os feriados de um ano específico via BrasilAPI.
 * @param {number} ano O ano para carregar os feriados.
 */
async function carregarFeriados(ano) {
    if (feriadosPorAno[ano]) {
        return; // Feriados para este ano já foram carregados
    }
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (!response.ok) throw new Error('Falha na resposta da API');
        const data = await response.json();
        feriadosPorAno[ano] = data.map(f => f.date); // Armazena "YYYY-MM-DD"
    } catch (error) {
        console.error("Erro ao carregar feriados:", error);
        // Exibe o erro em ambas as seções, pois não sabemos qual está ativa
        erroPVDDiv.textContent = "Erro ao carregar feriados. Verifique a conexão.";
        erroCPVDiv.textContent = "Erro ao carregar feriados. Verifique a conexão.";
    }
}

/**
 * Verifica se uma data é um feriado.
 * @param {Date} date O objeto Date a ser verificado.
 * @returns {boolean}
 */
function isFeriado(date) {
    const ano = date.getFullYear();
    if (!feriadosPorAno[ano]) return false; // Feriados do ano não carregados
    const dataFormatada = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    return feriadosPorAno[ano].includes(dataFormatada);
}

/**
 * Verifica se uma data cai em um fim de semana (Sábado ou Domingo).
 * @param {Date} date O objeto Date a ser verificado.
 * @returns {boolean}
 */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

/**
 * Adiciona um número específico de dias úteis a uma data, pulando fins de semana e feriados.
 * @param {Date} startDate A data inicial.
 * @param {number} days O número de dias úteis a adicionar.
 * @returns {Date} A nova data após adicionar os dias úteis.
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
 * Conta os dias úteis entre duas datas.
 * @param {Date} startDate Data de início.
 * @param {Date} endDate Data de fim.
 * @returns {number} O número de dias úteis.
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

    const efetivacaoValue = dataEfetivacaoInput.value;
    if (!efetivacaoValue) {
        erroPVDDiv.textContent = "Por favor, informe a data da efetivação.";
        return;
    }

    const dataEfetivacao = new Date(efetivacaoValue);
    await carregarFeriados(dataEfetivacao.getFullYear());

    // O prazo é de 48h úteis, o que equivale a 2 dias úteis.
    const prazoFinal = addBusinessDays(dataEfetivacao, 2);
    const dataAtual = new Date();

    if (dataAtual > prazoFinal) {
        resultadoPVDDiv.textContent = "Prazo de 48h úteis excedido. Abrir vermelha comercial para a ouvidoria.";
        resultadoPVDDiv.classList.remove('text-green-800');
        resultadoPVDDiv.classList.add('text-red-800');
    } else {
        resultadoPVDDiv.textContent = "Dentro do prazo de 48h úteis. Direcione para o pós-vendas.";
        resultadoPVDDiv.classList.remove('text-red-800');
        resultadoPVDDiv.classList.add('text-green-800');
    }
}

/**
 * Processa a verificação do Caso Pós Vendas.
 */
async function processCPV() {
    erroCPVDiv.textContent = '';
    resultadoCPVDiv.textContent = '';
    
    const dataAberturaValue = dataAberturaInput.value;
    const numeroCasoValue = numeroCasoInput.value;

    if (!dataAberturaValue || !numeroCasoValue) {
        erroCPVDiv.textContent = "Por favor, preencha todos os campos.";
        return;
    }
    
    const dataAbertura = new Date(dataAberturaValue);
    const dataAtual = new Date();
    
    // Carrega feriados para ambos os anos, caso o período atravesse a virada do ano
    await carregarFeriados(dataAbertura.getFullYear());
    await carregarFeriados(dataAtual.getFullYear());

    const diffBusinessDays = countBusinessDays(dataAbertura, dataAtual);
    const prazoTotal = 50;

    if (diffBusinessDays > prazoTotal) {
        resultadoCPVDiv.textContent = `${prazoTotal} dias úteis excedidos. Abrir um caso de vermelha comercial e anexar as evidências se já os tiver`;
    } else {
        const diasRestantes = prazoTotal - diffBusinessDays;
        const verbo = diasRestantes === 1 ? "resta" : "restam";
        const plural = diasRestantes === 1 ? "dia útil" : "dias úteis";
        resultadoCPVDiv.textContent = `Para o caso ${numeroCasoValue}, ${verbo} ${diasRestantes} ${plural} para tratativa. Abrir caso de dúvida para a fila do setor 'Pós-Vendas'.`;
    }
}


function showSection(sectionId) {
    pvdSection.classList.add('hidden');
    cpvSection.classList.add('hidden');
    document.getElementById(sectionId).classList.remove('hidden');
}

function resetPVD() {
    dataEfetivacaoInput.value = '';
    resultadoPVDDiv.textContent = '';
    erroPVDDiv.textContent = '';
}

function resetCPV() {
    dataAberturaInput.value = '';
    numeroCasoInput.value = '';
    resultadoCPVDiv.textContent = '';
    erroCPVDiv.textContent = '';
}


// --- "Escutadores" de Eventos (Event Listeners) ---

document.getElementById('btn-show-pvd').addEventListener('click', () => showSection('pvd'));
document.getElementById('btn-show-cpv').addEventListener('click', () => showSection('cpv'));

document.getElementById('btn-process-pvd').addEventListener('click', processPVD);
document.getElementById('btn-reset-pvd').addEventListener('click', resetPVD);

document.getElementById('btn-process-cpv').addEventListener('click', processCPV);
document.getElementById('btn-reset-cpv').addEventListener('click', resetCPV);

// Carrega os feriados do ano corrente ao iniciar a página, para uma resposta mais rápida no primeiro uso.
window.addEventListener('DOMContentLoaded', () => {
    const anoAtual = new Date().getFullYear();
    carregarFeriados(anoAtual);
});