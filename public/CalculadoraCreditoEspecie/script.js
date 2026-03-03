// Elementos da Calculadora Principal
const dataContemplacaoInput = document.getElementById('data-contemplacao');
const grupoEncerradoCheck = document.getElementById('grupo-encerrado-check');
const encerramentoContainer = document.getElementById('encerramento-container');
const dataEncerramentoInput = document.getElementById('data-encerramento');
const calcularBtnEl = document.getElementById('calcular-btn');
const resetBtnEl = document.getElementById('reset-btn');
const resultadoDivEl = document.getElementById('resultado');
const mensagemErroDivEl = document.getElementById('mensagem-erro');
const infoLegalDiv = document.getElementById('info-legal');
const somDinheiroEl = document.getElementById('som-dinheiro');

// Elementos do Módulo Crédito vs Débito
const btnToggleCreditoDebito = document.getElementById('btn-toggle-credito-debito');
const moduloCreditoDebito = document.getElementById('modulo-credito-debito');
const inputCredito = document.getElementById('input-credito');
const inputDebito = document.getElementById('input-debito');
const inputDataModulo = document.getElementById('input-data');
const btnCalcularModulo = document.getElementById('theme-btn');
const btnZerarModulo = document.getElementById('btn-zerar');
const containerResultadoModulo = document.getElementById('resultado-container');
const resCredito = document.getElementById('res-credito');
const resDebito = document.getElementById('res-debito');
const resLiquido = document.getElementById('res-liquido');
const resMensagem = document.getElementById('res-mensagem');

// Utilitários de formatação e conversão
const formatMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
const formatDataBR = (dataObj) => new Intl.DateTimeFormat('pt-BR').format(dataObj);

const parseMoedaToFloat = (valorString) => {
    if (!valorString) return NaN;
    const apenasDigitos = valorString.replace(/\D/g, '');
    return parseFloat(apenasDigitos) / 100;
};

const mascaraMoeda = (event) => {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor === '') {
        event.target.value = '';
        return;
    }
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    event.target.value = formatMoeda(valor);
};

// Funções da Calculadora Principal
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
    dataContemplacaoInput.value = '';
    dataEncerramentoInput.value = '';
    grupoEncerradoCheck.checked = false;
    encerramentoContainer.classList.add('hidden');
    resultadoDivEl.textContent = ''; 
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.className = 'text-center text-lg p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95';
    infoLegalDiv.classList.add('hidden');
}

function calcularData() {
    mensagemErroDivEl.textContent = '';
    resultadoDivEl.textContent = ''; 
    resultadoDivEl.className = 'text-center text-lg p-4 rounded-lg transition-all duration-500 opacity-0 transform scale-95';
    infoLegalDiv.classList.add('hidden');

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const resultado = CreditoService.calcularElegibilidade(
        dataContemplacaoInput.value,
        grupoEncerradoCheck.checked,
        dataEncerramentoInput.value,
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

    // Prevenção de XSS na injeção de dados
    resultadoDivEl.appendChild(iconeNode);
    resultadoDivEl.appendChild(spanTitulo);
    resultadoDivEl.appendChild(quebraLinha);
    resultadoDivEl.appendChild(descricaoNode);

    resultadoDivEl.classList.remove('opacity-0', 'scale-95');
    resultadoDivEl.classList.add('opacity-100', 'scale-100');
    infoLegalDiv.classList.remove('hidden');

    // Feedback sonoro
    if (resultado.tocarSom) {
        somDinheiroEl.currentTime = 0;
        const promise = somDinheiroEl.play();
        if (promise !== undefined) {
            promise.catch(error => console.error("Reprodução de áudio bloqueada pelo navegador.", error));
        }
    }
}

// Funções do Módulo Crédito Menos Débito
function toggleModuloCreditoDebito() {
    if (moduloCreditoDebito) {
        moduloCreditoDebito.classList.toggle('hidden');
    }
}

function zerarModuloCreditoDebito() {
    if (inputCredito) inputCredito.value = '';
    if (inputDebito) inputDebito.value = '';
    if (inputDataModulo) inputDataModulo.value = '';
    if (containerResultadoModulo) containerResultadoModulo.classList.add('hidden');
}

function calcularModuloCreditoDebito() {
    const credito = parseMoedaToFloat(inputCredito.value);
    const debito = parseMoedaToFloat(inputDebito.value) || 0;
    const dataStr = inputDataModulo.value;

    if (isNaN(credito) || !dataStr) {
        alert('Por favor, informe ao menos o Crédito e a Data da Contemplação.');
        return;
    }

    const resultado = CreditoService.processarCalculoCreditoDebito(credito, debito, dataStr);

    if (!resultado.sucesso) {
        alert(resultado.mensagem);
        containerResultadoModulo.classList.add('hidden');
        return;
    }

    resCredito.textContent = formatMoeda(credito);
    resDebito.textContent = `- ${formatMoeda(debito)}`;
    resLiquido.textContent = formatMoeda(resultado.liquido);
    resMensagem.textContent = `Crédito de ${formatMoeda(resultado.liquido)} para faturar em espécie a partir de ${formatDataBR(resultado.dataLiberacao)}.`;

    containerResultadoModulo.classList.remove('hidden');
}

// Event Listeners
if (grupoEncerradoCheck) {
    grupoEncerradoCheck.addEventListener('change', () => {
        encerramentoContainer.classList.toggle('hidden');
    });
}

if (calcularBtnEl) calcularBtnEl.addEventListener('click', calcularData);
if (resetBtnEl) resetBtnEl.addEventListener('click', resetCalculadora);
if (dataContemplacaoInput) dataContemplacaoInput.addEventListener('input', () => formatarData(dataContemplacaoInput));
if (dataEncerramentoInput) dataEncerramentoInput.addEventListener('input', () => formatarData(dataEncerramentoInput));

if (btnToggleCreditoDebito) btnToggleCreditoDebito.addEventListener('click', toggleModuloCreditoDebito);
if (btnCalcularModulo) btnCalcularModulo.addEventListener('click', calcularModuloCreditoDebito);
if (btnZerarModulo) btnZerarModulo.addEventListener('click', zerarModuloCreditoDebito);

if (inputCredito) inputCredito.addEventListener('input', mascaraMoeda);
if (inputDebito) inputDebito.addEventListener('input', mascaraMoeda);