// Função para alternar entre as seções  
function showSection(section) {  
    document.getElementById('pvd').classList.add('hidden');  
    document.getElementById('cpv').classList.add('hidden');  
    if (section === 'pvd') {  
        document.getElementById('pvd').classList.remove('hidden');  
    } else {  
        document.getElementById('cpv').classList.remove('hidden');  
    }  
}  

// Função para coletar a data de efetivação  
function getEfetivacaoDate() {  
    document.getElementById('efetivacaoDiv').classList.remove('hidden');  
}  

// Processa a seção de Pós Vendas Digital  
function processPVD() {  
    const efetivacaoInput = document.getElementById('dataEfetivacao').value;  
    const dataAtual = new Date();  
    const dataEfetivacao = new Date(efetivacaoInput);  
    const resultadoDiv = document.getElementById('resultadoPVD');  

    // Calcula a diferença em horas  
    const diffHours = (dataAtual - dataEfetivacao) / (1000 * 60 * 60);  

    if (diffHours < 48) {  
        resultadoDiv.textContent = "Por favor, direcione imediatamente para o pós vendas.";  
    } else {  
        resultadoDiv.textContent = "Tratativa digital pelo pós vendas realizada a mais de 48 horas úteis, por favor abrir vermelha comercial.";  
    }  
}  

// Processa a seção de Caso Pós Vendas  
function processCPV() {  
    const dataInput = parseDate(document.getElementById('dataCPV').value);  
    const numeroCaso = document.getElementById('numeroCaso').value;  
    const dataAberturaInput = parseDate(document.getElementById('dataAbertura').value);  

    // Validação de campo numérico obrigatório  
    if (isNaN(parseInt(numeroCaso))) {  
        alert("Por favor, digite apenas números no campo 'Número do caso'.");  
        return;  
    }  

    // Validação de campo de data  
    if (isNaN(parseInt(dataInput.getDate())) || isNaN(parseInt(dataAberturaInput.getDate()))) {  
        alert("Por favor, digite apenas números e barras (formato DD/MM/AAAA) nos campos de data.");  
        return;  
    }  

    const data = dataInput;  
    const dataAbertura = dataAberturaInput;  
    const resultadoDiv = document.getElementById('resultadoCPV');  

    // Contamos os dias úteis entre a data de abertura e a data atual  
    const diffBusinessDays = countBusinessDays(dataAbertura, data);  

    if (diffBusinessDays > 50) {  
        resultadoDiv.textContent = "50 dias úteis excedidos. Por favor, abra um caso para a área comercial.";  
    } else {  
        const diasRestantes = 50 - diffBusinessDays;    
        const palavraDia = diasRestantes === 1 ? "dia" : "dias";  
    
        resultadoDiv.textContent = `O caso ${numeroCaso} ainda resta ${diasRestantes} ${palavraDia} úteis para tratativa. Por favor, acione o departamento de Pós-vendas imediatamente para seguir com a demanda.`;  
    }  
} 

// Função para converter a entrada de texto em um objeto Date  
function parseDate(dateString) {  
    const parts = dateString.split('/');  
    if (parts.length === 3) {  
        const day = parseInt(parts[0], 10);  
        const month = parseInt(parts[1], 10) - 1; // Meses em JavaScript são de 0 a 11  
        const year = parseInt(parts[2], 10);  
        return new Date(year, month, day);  
    }  
    return null;  
}  

// Função para verificar se um dia é um fim de semana  
function isWeekend(date) {  
    const day = date.getDay();  
    return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado  
}  

// Função para contar dias úteis entre duas datas  
function countBusinessDays(startDate, endDate) {  
    let count = 0;  
    const currentDate = new Date(startDate);  

    while (currentDate <= endDate) {  
        if (!isWeekend(currentDate)) {  
            count++;  
        }  
        currentDate.setDate(currentDate.getDate() + 1);  
    }  
    return count;  
}  

// Função para zerar os campos da seção Pós Vendas Digital  
function resetPVD() {  
    document.getElementById('dataPVD').value = '';  
    document.getElementById('resultadoPVD').textContent = '';  
    document.getElementById('efetivacaoDiv').classList.add('hidden');  
    document.getElementById('dataEfetivacao').value = '';  
}  

// Função para zerar os campos da seção Caso Pós Vendas  
function resetCPV() {  
    document.getElementById('dataCPV').value = '';  
    document.getElementById('numeroCaso').value = '';  
    document.getElementById('dataAbertura').value = '';  
    document.getElementById('resultadoCPV').textContent = '';  
}  