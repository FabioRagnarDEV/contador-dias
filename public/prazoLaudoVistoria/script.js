/**
 * 1. Mapeamento de Elementos (DOM)
 */
const dataAprovacaoInput = document.getElementById('data-aprovacao');
const calcularBtnEl = document.getElementById('calcular-btn');
const resetBtnEl = document.getElementById('reset-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');
const somDinheiroEl = document.getElementById('som-dinheiro');

/**
 * 2. Funções de Ação e Formatação
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

function resetCalculadora() {
    dataAprovacaoInput.value = '';
    resultadoDivEl.textContent = ''; 
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.className = 'text-center text-lg p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95 font-semibold';
}

function calcularValidade() {
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = ''; 
    resultadoDivEl.className = 'text-center text-lg p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95 font-semibold';

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const resultado = LaudoService.verificarValidade(
        dataAprovacaoInput.value,
        dataAtual
    );

    if (resultado.erro) {
        mensagemErroDivEl.textContent = resultado.erro;
        return;
    }

    resultadoDivEl.classList.add(resultado.corFundo, resultado.corTexto);

    const iconeNode = document.createTextNode(resultado.icone + ' ');
    const spanTitulo = document.createElement('span');
    spanTitulo.className = 'font-bold';
    spanTitulo.textContent = resultado.titulo;
    const quebraLinha = document.createElement('br');
    const descricaoNode = document.createTextNode(resultado.descricao);

    resultadoDivEl.appendChild(iconeNode);
    resultadoDivEl.appendChild(spanTitulo);
    resultadoDivEl.appendChild(quebraLinha);
    resultadoDivEl.appendChild(descricaoNode);

    resultadoDivEl.classList.remove('opacity-0', 'scale-95');
    resultadoDivEl.classList.add('opacity-100', 'scale-100');
    
    if (resultado.tocarSom && somDinheiroEl) {
        somDinheiroEl.currentTime = 0;
        const promise = somDinheiroEl.play();
        if (promise !== undefined) {
            promise.catch(error => console.error("Reprodução de áudio bloqueada pelo navegador.", error));
        }
    }
}

/**
 * 3. Ouvintes de Eventos (Event Listeners)
 */
if (calcularBtnEl) {
    calcularBtnEl.addEventListener('click', calcularValidade);
}

if (resetBtnEl) {
    resetBtnEl.addEventListener('click', resetCalculadora);
}

if (dataAprovacaoInput) {
    dataAprovacaoInput.addEventListener('input', () => formatarData(dataAprovacaoInput));
}