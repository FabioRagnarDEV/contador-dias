// ─── Utilitários ──────────────────────────────────────────────────────────────

const formatMoeda  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const formatDataBR = (d) => new Intl.DateTimeFormat('pt-BR').format(d);

const parseMoedaToFloat = (str) => {
    if (!str) return NaN;
    return parseFloat(str.replace(/\D/g, '')) / 100;
};

const mascaraMoeda = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (!v) { e.target.value = ''; return; }
    e.target.value = formatMoeda(parseInt(v, 10) / 100);
};

const mascaraData = (input) => {
    let v = input.value.replace(/\D/g, '').substring(0, 8);
    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{2})/, '$1/$2');
    input.value = v;
};

// ─── Referências DOM ──────────────────────────────────────────────────────────

// Etapas
const etapa1   = document.getElementById('etapa-1');
const etapa2a  = document.getElementById('etapa-2a');
const etapa2b  = document.getElementById('etapa-2b');

// Stepper
const dot1   = document.getElementById('dot-1');
const dot2   = document.getElementById('dot-2');
const dot3   = document.getElementById('dot-3');
const line1  = document.getElementById('line-1');
const line2  = document.getElementById('line-2');

// Inputs
const dataContemplacaoInput  = document.getElementById('data-contemplacao');
const dataEncerramentoVInput = document.getElementById('data-encerramento-v');
// Campos ocultos mantidos para compatibilidade com CreditoService
const dataEncerramentoInput  = document.getElementById('data-encerramento');
const grupoEncerradoCheck    = document.getElementById('grupo-encerrado-check');

// Botões de navegação
const btnAvancar1   = document.getElementById('btn-avancar-1');
const btnVoltar2a   = document.getElementById('btn-voltar-2a');
const btnCalcular2a = document.getElementById('btn-calcular-2a');
const btnVoltar2b   = document.getElementById('btn-voltar-2b');
const btnCalcular2b = document.getElementById('btn-calcular-2b');
const resetBtn      = document.getElementById('reset-btn');

// Resultado
const resultadoCard    = document.getElementById('resultado-card');
const resultadoTopo    = document.getElementById('resultado-topo');
const resultadoIcone   = document.getElementById('resultado-icone');
const resultadoTitulo  = document.getElementById('resultado-titulo');
const resultadoDescricao = document.getElementById('resultado-descricao');
const resultadoDetalhe = document.getElementById('resultado-detalhe');
const infoLegalDiv     = document.getElementById('info-legal');
const mensagemErroEl   = document.getElementById('mensagem-erro');
const somDinheiroEl    = document.getElementById('som-dinheiro');

// Script de e-mail
const wrapperEmail = document.getElementById('wrapper-script-email');
const btnEmail     = document.getElementById('btn-script-email');
const msgCopiado   = document.getElementById('msg-copiado-email');

// Módulo crédito-débito
const inputCredito           = document.getElementById('input-credito');
const inputDebito            = document.getElementById('input-debito');
const inputDataModulo        = document.getElementById('input-data');
const btnCalcularModulo      = document.getElementById('theme-btn');
const btnZerarModulo         = document.getElementById('btn-zerar');
const containerResultadoMod  = document.getElementById('resultado-container');
const resCredito             = document.getElementById('res-credito');
const resDebito              = document.getElementById('res-debito');
const resLiquido             = document.getElementById('res-liquido');
const resMensagem            = document.getElementById('res-mensagem');

// Estado
let ultimoResultado = null;
let fluxoAtual = null; // 'ativo' | 'encerrado'


// ─── Stepper ──────────────────────────────────────────────────────────────────

function atualizarStepper(etapa) {
    [dot1, dot2, dot3].forEach(d => d.classList.remove('done'));
    [line1, line2].forEach(l => l.classList.remove('done'));

    if (etapa >= 2) { dot1.classList.add('done'); dot1.textContent = '✓'; line1.classList.add('done'); }
    else { dot1.textContent = '1'; }

    if (etapa >= 3) { dot2.classList.add('done'); dot2.textContent = '✓'; line2.classList.add('done');
                      dot3.classList.add('done'); dot3.textContent = '✓'; }
    else { dot2.textContent = '2'; dot3.textContent = '3'; }
}


// ─── Navegação entre etapas ───────────────────────────────────────────────────

function irParaEtapa(etapaAtual, etapaDestino) {
    etapaAtual.classList.remove('ativa');
    setTimeout(() => { etapaDestino.classList.add('ativa'); }, 50);
}

// Etapa 1 → Etapa 2
btnAvancar1.addEventListener('click', () => {
    const radio = document.querySelector('input[name="situacao-grupo"]:checked');
    if (!radio) return;
    fluxoAtual = radio.value;

    if (fluxoAtual === 'ativo') {
        grupoEncerradoCheck.checked = false;
        irParaEtapa(etapa1, etapa2a);
    } else {
        grupoEncerradoCheck.checked = true;
        irParaEtapa(etapa1, etapa2b);
    }
    atualizarStepper(2);
    mensagemErroEl.textContent = '';
});

// Voltar da Etapa 2A para Etapa 1
btnVoltar2a.addEventListener('click', () => {
    irParaEtapa(etapa2a, etapa1);
    atualizarStepper(1);
    esconderResultado();
});

// Voltar da Etapa 2B para Etapa 1
btnVoltar2b.addEventListener('click', () => {
    irParaEtapa(etapa2b, etapa1);
    atualizarStepper(1);
    esconderResultado();
    document.querySelectorAll('input[name="saldo-quitado"]').forEach(r => r.checked = false);
});

// Habilita o botão Avançar quando um radio da etapa 1 for selecionado
document.querySelectorAll('input[name="situacao-grupo"]').forEach(r => {
    r.addEventListener('change', () => { btnAvancar1.disabled = false; });
});


// ─── Cálculo ──────────────────────────────────────────────────────────────────

function calcularGrupoAtivo() {
    mensagemErroEl.textContent = '';
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const resultado = CreditoService.calcularElegibilidade(
        dataContemplacaoInput.value,
        false,
        '',
        dataAtual
    );

    if (resultado.erro) { mensagemErroEl.textContent = resultado.erro; return; }

    ultimoResultado = resultado;
    atualizarStepper(3);
    renderizarResultado(resultado);
}

function calcularGrupoEncerrado() {
    mensagemErroEl.textContent = '';
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const saldoRadio = document.querySelector('input[name="saldo-quitado"]:checked');

    // Grupo encerrado + cota quitada → liberado imediatamente
    if (saldoRadio && saldoRadio.value === 'sim') {
        ultimoResultado = { diasRestantes: 0 };
        atualizarStepper(3);
        renderizarResultadoImediato();
        return;
    }

    // Grupo encerrado com saldo devedor → verifica data de encerramento
    if (!saldoRadio) { mensagemErroEl.textContent = 'Informe se o saldo devedor está quitado.'; return; }

    // Sincroniza o campo oculto com o visível
    dataEncerramentoInput.value = dataEncerramentoVInput.value;

    const resultado = CreditoService.calcularElegibilidade(
        dataContemplacaoInput.value || '01/01/2000', // placeholder; não usado no caminho encerrado
        true,
        dataEncerramentoVInput.value,
        dataAtual
    );

    if (resultado.erro) {
        // Erro provavelmente é sobre a data de encerramento
        mensagemErroEl.textContent = resultado.erro.replace('contemplação', 'encerramento');
        return;
    }

    ultimoResultado = resultado;
    atualizarStepper(3);
    renderizarResultado(resultado);
}

btnCalcular2a.addEventListener('click', calcularGrupoAtivo);
btnCalcular2b.addEventListener('click', calcularGrupoEncerrado);

// Enter dispara o cálculo na etapa ativa
dataContemplacaoInput.addEventListener('keydown',  e => { if (e.key === 'Enter') calcularGrupoAtivo(); });
dataEncerramentoVInput.addEventListener('keydown', e => { if (e.key === 'Enter') calcularGrupoEncerrado(); });


// ─── Renderização do resultado ────────────────────────────────────────────────

function renderizarResultadoImediato() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const tituloFinal = nomeUsuario
        ? `${nomeUsuario}, pode receber imediatamente! ✅`
        : 'SIM, pode receber imediatamente.';

    resultadoTopo.className      = 'p-5 flex items-center gap-4 bg-green-50';
    resultadoTitulo.className    = 'text-lg font-extrabold leading-tight text-green-800';
    resultadoDescricao.className = 'text-sm font-medium opacity-90 mt-0.5 text-green-700';
    resultadoIcone.textContent   = '✅';
    resultadoTitulo.textContent  = tituloFinal;
    resultadoDescricao.textContent = 'Grupo encerrado e cota quitada — prazo de 180 dias dispensado.';

    resultadoDetalhe.className   = 'rounded-xl p-4 text-sm font-medium border bg-green-50 border-green-200 text-green-800';
    resultadoDetalhe.textContent = '✅ A cota está apta para solicitação do crédito em espécie. Basta verificar o cadastro e iniciar o processo de pagamento ao titular.';
    resultadoDetalhe.classList.remove('hidden');

    infoLegalDiv.classList.remove('hidden');
    if (wrapperEmail) wrapperEmail.classList.add('hidden');
    exibirCard();
    tocarSom();
}

function renderizarResultado(resultado) {
    const aprovado = resultado.tocarSom;
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const prefixoNome = nomeUsuario ? `${nomeUsuario}... ` : '';

    // Sorteia mensagem engraçada aleatoriamente se prazo não cumprido
    let tituloFinal = resultado.titulo;
    if (!aprovado && resultado.listaMensagens && resultado.listaMensagens.length) {
        const idx = Math.floor(Math.random() * resultado.listaMensagens.length);
        tituloFinal = prefixoNome + resultado.listaMensagens[idx];
    } else if (aprovado && nomeUsuario) {
        tituloFinal = `${nomeUsuario}, está apto para receber! ✅`;
    }

    const isAmarelo = resultado.corFundo === 'bg-yellow-100';

    resultadoTopo.className      = `p-5 flex items-center gap-4 ${aprovado ? 'bg-green-50' : isAmarelo ? 'bg-yellow-50' : 'bg-red-50'}`;
    resultadoTitulo.className    = `text-lg font-extrabold leading-tight ${aprovado ? 'text-green-800' : isAmarelo ? 'text-yellow-800' : 'text-red-800'}`;
    resultadoDescricao.className = `text-sm font-medium opacity-90 mt-0.5 ${aprovado ? 'text-green-700' : isAmarelo ? 'text-yellow-700' : 'text-red-600'}`;

    resultadoIcone.textContent     = resultado.icone;
    resultadoTitulo.textContent    = tituloFinal;
    resultadoDescricao.textContent = resultado.descricao;

    // Detalhe contextual
    if (resultado.diasRestantes > 0) {
        resultadoDetalhe.className   = 'rounded-xl p-4 text-sm font-medium border bg-red-50 border-red-200 text-red-800';
        resultadoDetalhe.textContent = `⏳ Faltam ainda ${resultado.diasRestantes} dia${resultado.diasRestantes !== 1 ? 's' : ''} para o prazo ser cumprido. A data prevista de liberação é ${resultado.dataFinalFormatada}.`;
        resultadoDetalhe.classList.remove('hidden');
        if (wrapperEmail) wrapperEmail.classList.remove('hidden');
    } else if (isAmarelo) {
        resultadoDetalhe.className   = 'rounded-xl p-4 text-sm font-medium border bg-yellow-50 border-yellow-200 text-yellow-800';
        resultadoDetalhe.textContent = 'ℹ️ A data de encerramento informada ainda é futura. Aguarde a última assembleia para liberar o recebimento em espécie.';
        resultadoDetalhe.classList.remove('hidden');
        if (wrapperEmail) wrapperEmail.classList.add('hidden');
    } else {
        resultadoDetalhe.classList.add('hidden');
        if (wrapperEmail) wrapperEmail.classList.add('hidden');
    }

    infoLegalDiv.classList.remove('hidden');
    exibirCard();
    if (resultado.tocarSom) tocarSom();
}

function exibirCard() {
    resultadoCard.classList.add('visible');
    resetBtn.classList.remove('hidden');

    resultadoIcone.classList.add('pulse-once');
    setTimeout(() => resultadoIcone.classList.remove('pulse-once'), 600);
}

function esconderResultado() {
    resultadoCard.classList.remove('visible');
    resetBtn.classList.add('hidden');
    mensagemErroEl.textContent = '';
    ultimoResultado = null;
    if (wrapperEmail) wrapperEmail.classList.add('hidden');
    infoLegalDiv.classList.add('hidden');
    resultadoDetalhe.classList.add('hidden');
}

function tocarSom() {
    somDinheiroEl.currentTime = 0;
    somDinheiroEl.play().catch(() => {});
}

// Nova consulta
resetBtn.addEventListener('click', () => {
    esconderResultado();
    irParaEtapa(etapa2a.classList.contains('ativa') ? etapa2a : etapa2b, etapa1);
    atualizarStepper(1);
    dataContemplacaoInput.value  = '';
    dataEncerramentoVInput.value = '';
    document.querySelectorAll('input[name="saldo-quitado"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[name="situacao-grupo"]').forEach(r => r.checked = false);
    btnAvancar1.disabled = true;
});


// ─── Gerador de e-mail ────────────────────────────────────────────────────────

function gerarScriptEmail() {
    if (!ultimoResultado || ultimoResultado.diasRestantes <= 0) return;

    const dias           = ultimoResultado.diasRestantes;
    const dataLiberacao  = ultimoResultado.dataFinalFormatada;

    const texto =
`[Nome do Consorciado], agradecemos o seu contato.

Em atenção à sua solicitação de recebimento do crédito em espécie referente à sua cota de consórcio, informamos que, após análise, a cota ainda não se encontra apta para o faturamento nesta modalidade.

Conforme previsto na Cláusula 32 do regulamento, é necessário o cumprimento de um prazo de carência de 180 (cento e oitenta) dias contados a partir da data da contemplação para que o crédito possa ser recebido em espécie, desde que a cota esteja devidamente quitada.

Situação atual da cota:

• Prazo de carência: 180 dias após a contemplação
• Dias restantes para liberação: ${dias} dia${dias !== 1 ? 's' : ''}
• Data prevista para liberação: ${dataLiberacao}
• Requisito adicional: quitação total das obrigações junto ao grupo e à administradora

Após o cumprimento integral do prazo e a verificação dos demais requisitos contratuais, o crédito poderá ser solicitado e será pago exclusivamente em favor do titular da cota.

Para maiores informações, consulte a Cláusula 32 do seu regulamento ou entre em contato com nossa equipe.

Permanecemos à disposição para quaisquer esclarecimentos adicionais.

Atenciosamente,
[Assinatura]`;

    navigator.clipboard.writeText(texto).then(() => {
        msgCopiado.style.opacity = '1';
        setTimeout(() => { msgCopiado.style.opacity = '0'; }, 3000);
    }).catch(() => alert('Erro ao copiar. Verifique as permissões do navegador.'));
}

if (btnEmail) btnEmail.addEventListener('click', gerarScriptEmail);


// ─── Módulo Crédito menos Débito ──────────────────────────────────────────────

function calcularModuloCreditoDebito() {
    const credito = parseMoedaToFloat(inputCredito.value);
    const debito  = parseMoedaToFloat(inputDebito.value) || 0;
    const dataStr = inputDataModulo.value;

    if (isNaN(credito) || !dataStr) {
        alert('Por favor, informe ao menos o Crédito e a Data da Contemplação.');
        return;
    }

    const resultado = CreditoService.processarCalculoCreditoDebito(credito, debito, dataStr);

    if (!resultado.sucesso) {
        alert(resultado.mensagem);
        containerResultadoMod.classList.add('hidden');
        return;
    }

    resCredito.textContent  = formatMoeda(credito);
    resDebito.textContent   = `- ${formatMoeda(debito)}`;
    resLiquido.textContent  = formatMoeda(resultado.liquido);
    resMensagem.textContent = `Crédito de ${formatMoeda(resultado.liquido)} disponível para faturamento em espécie a partir de ${formatDataBR(resultado.dataLiberacao)}.`;

    containerResultadoMod.classList.remove('hidden');
}

function zerarModuloCreditoDebito() {
    if (inputCredito)     inputCredito.value  = '';
    if (inputDebito)      inputDebito.value   = '';
    if (inputDataModulo)  inputDataModulo.value = '';
    if (containerResultadoMod) containerResultadoMod.classList.add('hidden');
}

if (btnCalcularModulo) btnCalcularModulo.addEventListener('click', calcularModuloCreditoDebito);
if (btnZerarModulo)    btnZerarModulo.addEventListener('click', zerarModuloCreditoDebito);
if (inputCredito)      inputCredito.addEventListener('input', mascaraMoeda);
if (inputDebito)       inputDebito.addEventListener('input', mascaraMoeda);


// ─── Máscaras de data ─────────────────────────────────────────────────────────

dataContemplacaoInput.addEventListener('input',  () => mascaraData(dataContemplacaoInput));
dataEncerramentoVInput.addEventListener('input', () => mascaraData(dataEncerramentoVInput));
