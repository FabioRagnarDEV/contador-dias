let feriados = [];

// Carrega os feriados do ano corrente via BrasilAPI
async function carregarFeriados(ano) {
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        const data = await response.json();
        feriados = data.map(f => f.date); // Formato: "YYYY-MM-DD"
    } catch (error) {
        console.error("Erro ao carregar feriados:", error);
        alert("Não foi possível carregar os feriados. Verifique sua conexão com a internet.");
    }
}

// Verifica se uma data é feriado
function isFeriado(date) {
    const dataFormatada = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return feriados.includes(dataFormatada);
}

// Verifica se a data é fim de semana
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo ou Sábado
}

// Conta os dias úteis entre duas datas, excluindo fins de semana e feriados
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

// Converte data no formato DD/MM/AAAA para objeto Date
function parseDate(dateString) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return null;
}

// Alterna entre as seções PVD e CPV
function showSection(section) {
    document.getElementById('pvd').classList.add('hidden');
    document.getElementById('cpv').classList.add('hidden');
    document.getElementById(section).classList.remove('hidden');
}

// Mostra campo para inserir data de efetivação
function getEfetivacaoDate() {
    document.getElementById('efetivacaoDiv').classList.remove('hidden');
}

// Processa a verificação do Pós Vendas Digital
function processPVD() {
    const efetivacaoInput = document.getElementById('dataEfetivacao').value;
    const dataEfetivacao = new Date(efetivacaoInput);
    const dataAtual = new Date();
    const resultadoDiv = document.getElementById('resultadoPVD');

    const diffHours = (dataAtual - dataEfetivacao) / (1000 * 60 * 60);

    if (diffHours < 48) {
        resultadoDiv.textContent = "Por favor, direcione imediatamente para o pós vendas.";
    } else {
        resultadoDiv.textContent = "Tratativa digital pelo pós vendas realizada há mais de 48 horas úteis, por favor abrir vermelha comercial.";
    }
}

// Processa o caso do Pós Vendas
async function processCPV() {
    const dataInput = parseDate(document.getElementById('dataCPV').value);
    const numeroCaso = document.getElementById('numeroCaso').value;
    const dataAberturaInput = parseDate(document.getElementById('dataAbertura').value);
    const resultadoDiv = document.getElementById('resultadoCPV');

    // Validações básicas
    if (isNaN(parseInt(numeroCaso))) {
        alert("Por favor, digite apenas números no campo 'Número do caso'.");
        return;
    }
    if (!dataInput || !dataAberturaInput) {
        alert("Por favor, insira datas válidas no formato DD/MM/AAAA.");
        return;
    }

    // Carrega feriados se ainda não carregados
    if (feriados.length === 0) {
        await carregarFeriados(dataInput.getFullYear());
    }

    const diffBusinessDays = countBusinessDays(dataAberturaInput, dataInput);

    if (diffBusinessDays > 50) {
        resultadoDiv.textContent = "50 dias úteis excedidos. Por favor, abra um caso para a área comercial.";
    } else {
        const diasRestantes = 50 - diffBusinessDays;
        const palavraDia = diasRestantes === 1 ? "dia" : "dias";
        resultadoDiv.textContent = `O caso ${numeroCaso} ainda resta ${diasRestantes} ${palavraDia} úteis para tratativa. Por favor, abrir um caso de dúvida direcionada com a informação "Pós Vendas" e coloque na fila do setor.`;
    }
}

// Zera os campos da seção Pós Vendas Digital
function resetPVD() {
    document.getElementById('dataPVD').value = '';
    document.getElementById('resultadoPVD').textContent = '';
    document.getElementById('efetivacaoDiv').classList.add('hidden');
    document.getElementById('dataEfetivacao').value = '';
}

// Zera os campos da seção Caso Pós Vendas
function resetCPV() {
    document.getElementById('dataCPV').value = '';
    document.getElementById('numeroCaso').value = '';
    document.getElementById('dataAbertura').value = '';
    document.getElementById('resultadoCPV').textContent = '';
}

// Carrega feriados automaticamente ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
    const anoAtual = new Date().getFullYear();
    carregarFeriados(anoAtual);
});
