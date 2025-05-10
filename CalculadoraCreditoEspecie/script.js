// Função para formatar o input de data automaticamente com as barras
function formatarData(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (valor.length <= 2) {
        input.value = valor.replace(/(\d{2})/, '$1'); // Formata o dia
    } else if (valor.length <= 4) {
        input.value = valor.replace(/(\d{2})(\d{2})/, '$1/$2'); // Formata o dia e mês
    } else {
        input.value = valor.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3'); // Formata o dia, mês e ano
    }
}

// Função para calcular a data
function calcularData() {
    const dataInput = document.getElementById('data').value;  
    const diasInput = parseInt(document.getElementById('dias').value);  

    if (dataInput && diasInput) {  
        const [dia, mes, ano] = dataInput.split('/');  
        const dataInicial = new Date(`${ano}-${mes}-${dia}`);  
        const dataFinal = new Date(dataInicial);  
        dataFinal.setDate(dataInicial.getDate() + diasInput);  

        const dataAtual = new Date();   
        
        const resultadoDiv = document.getElementById('resultado');  

        // Compara a data final com a data atual  
        if (dataFinal < dataAtual) {  
            // Se a data final for anterior à data atual, exibe a mensagem "desde"  
            resultadoDiv.textContent = `A cota está apta para receber em espécie desde ${dataFinal.toLocaleDateString('pt-BR')}.`;  
        } else {  
            // Se a data final for igual ou posterior à data atual, exibe a mensagem "a partir de"  
            resultadoDiv.textContent = `A cota estará apta para receber em espécie a partir de ${dataFinal.toLocaleDateString('pt-BR')}.`;  
        }  
    } else {  
        alert('Por favor, preencha todos os campos corretamente.');  
    }  
}
