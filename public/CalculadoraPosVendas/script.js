// --- Seleção dos Elementos do DOM ---
const dataPagamentoInput = document.getElementById('data-pagamento');
const calcularBtn = document.getElementById('calcular-btn');
const zerarBtn = document.getElementById('zerar-btn');
const resultadoDiv = document.getElementById('resultado');
const mensagemErroDiv = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');
const contagemBtn = document.getElementById('contagem-btn');
const contagemResultadoDiv = document.getElementById('contagem-resultado');

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

function zerarCalculadora() {
    dataPagamentoInput.value = '';
    resultadoDiv.textContent = ''; // Limpeza de segurança (XSS)
    mensagemErroDiv.textContent = '';
    
    // Reseta as classes de formatação do resultado
    resultadoDiv.className = 'text-center text-lg font-bold p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95';
    
    infoLegalDiv.classList.add('hidden');
    contagemResultadoDiv.classList.add('hidden');
    contagemResultadoDiv.textContent = ''; 
}

function calcularPrazo() {
    mensagemErroDiv.textContent = '';
    resultadoDiv.textContent = ''; // Limpeza de segurança
    resultadoDiv.className = 'text-center text-lg font-bold p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95';
    infoLegalDiv.classList.add('hidden');
    contagemResultadoDiv.classList.add('hidden');
    contagemResultadoDiv.textContent = '';

    const dataAtual = new Date();
    
    // Delegação para o Cérebro (Service)
    const resultado = LeiArrependimentoService.calcularPrazo(dataPagamentoInput.value, dataAtual);

    if (resultado.erro) {
        mensagemErroDiv.textContent = resultado.erro;
        return;
    }

    // 🔒 Construção segura e estruturada do DOM (Mitigação de XSS)
    resultadoDiv.classList.add(resultado.corFundo, resultado.corTexto);

    const iconeNode = document.createTextNode(resultado.icone + ' ');
    const spanTitulo = document.createElement('span');
    spanTitulo.className = 'font-bold';
    spanTitulo.textContent = resultado.titulo;
    
    const quebraLinha1 = document.createElement('br');
    const descricaoNode = document.createTextNode(resultado.descricao);

    resultadoDiv.appendChild(iconeNode);
    resultadoDiv.appendChild(spanTitulo);
    resultadoDiv.appendChild(quebraLinha1);
    resultadoDiv.appendChild(descricaoNode);

    // Adiciona aviso caso o prazo expire no fim de semana
    if (resultado.isFimDeSemana) {
        const espaco1 = document.createElement('br');
        const espaco2 = document.createElement('br');
        
        const spanAtencao = document.createElement('strong');
        spanAtencao.className = 'text-amber-700';
        spanAtencao.textContent = 'Atenção: ';

        const textoAviso = document.createTextNode(`O dia ${resultado.prazoFinalFormatado} é um `);
        
        const strongDia = document.createElement('strong');
        strongDia.textContent = resultado.nomeDiaFimSemana;

        const textoComplemento = document.createTextNode(`. Favor verificar com seu líder/madrinha imediata para verificar exceção.`);

        resultadoDiv.appendChild(espaco1);
        resultadoDiv.appendChild(espaco2);
        resultadoDiv.appendChild(spanAtencao);
        resultadoDiv.appendChild(textoAviso);
        resultadoDiv.appendChild(strongDia);
        resultadoDiv.appendChild(textoComplemento);
    }

    resultadoDiv.classList.remove('opacity-0', 'scale-95');
    resultadoDiv.classList.add('opacity-100', 'scale-100');
    infoLegalDiv.classList.remove('hidden');
}

function mostrarContagem() {
    contagemResultadoDiv.textContent = ''; // Limpeza de segurança
    
    const dias = LeiArrependimentoService.gerarContagemDias(dataPagamentoInput.value);
    
    if (!dias) {
        mensagemErroDiv.textContent = 'Insira uma data válida primeiro para ver a contagem.';
        return;
    }

    // 🔒 Construção segura da lista de dias (Mitigação de XSS)
    const titulo = document.createElement('h4');
    titulo.className = 'font-bold mb-3 text-slate-800';
    titulo.textContent = 'Contagem do Prazo:';
    
    const ul = document.createElement('ul');
    ul.className = 'space-y-2 text-sm text-slate-700 text-left w-max mx-auto';

    dias.forEach(dia => {
        const li = document.createElement('li');
        const strongDia = document.createElement('strong');
        
        if (dia.isUltimoDia) {
            li.className = 'font-bold text-base mt-3 pt-3 border-t border-slate-300 text-slate-900';
            strongDia.textContent = `Dia ${dia.diaNumero} (Prazo Final): `;
        } else {
            strongDia.textContent = `Dia ${dia.diaNumero}: `;
        }

        const dataTexto = document.createTextNode(dia.dataTexto);
        
        li.appendChild(strongDia);
        li.appendChild(dataTexto);

        // Se for o último dia E cair no fim de semana, destaca o alerta
        if (dia.isUltimoDia && dia.isFimDeSemana) {
            const avisoExtra = document.createElement('strong');
            avisoExtra.className = 'text-amber-700 ml-1';
            avisoExtra.textContent = `(${dia.nomeDia})`;
            li.appendChild(avisoExtra);
        }

        ul.appendChild(li);
    });

    contagemResultadoDiv.appendChild(titulo);
    contagemResultadoDiv.appendChild(ul);
    contagemResultadoDiv.classList.remove('hidden');
}

// --- "Escutadores" de Eventos ---
calcularBtn.addEventListener('click', calcularPrazo);
zerarBtn.addEventListener('click', zerarCalculadora);
dataPagamentoInput.addEventListener('input', () => formatarData(dataPagamentoInput));
contagemBtn.addEventListener('click', mostrarContagem);