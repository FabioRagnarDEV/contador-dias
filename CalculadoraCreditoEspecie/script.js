function calcularData() {  
    // Obtém os valores de entrada do usuário  
    const dataInput = document.getElementById('data').value;  
    const diasInput = parseInt(document.getElementById('dias').value);  

    // Verifica se os campos foram preenchidos corretamente  
    if (dataInput && diasInput) {  
        // Divide a data de entrada (DD/MM/AAAA) em partes separadas  
        const [dia, mes, ano] = dataInput.split('/');  
        
        // Cria um objeto Date a partir da data inserida pelo usuário  
        const dataInicial = new Date(`${ano}-${mes}-${dia}`);  
        
        // Cria uma nova data que será a data inicial mais a quantidade de dias  
        const dataFinal = new Date(dataInicial);  
        dataFinal.setDate(dataInicial.getDate() + diasInput);  

        // Obtém a data atual  
        const dataAtual = new Date();   
        
        // Seleciona a div onde o resultado será exibido  
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
        // Alerta o usuário se os campos não foram preenchidos corretamente  
        alert('Por favor, preencha todos os campos corretamente.');  
    }  
}  