document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    //                    1. REFERÊNCIAS GERAIS (VARIÁVEIS)
    // ==========================================================================
    const botaoCalcular = document.getElementById('calcular-btn');
    const botaoZerar = document.getElementById('reset-btn');
    const entradaDataVencimento = document.getElementById('data-vencimento');
    const entradaParcelas = document.getElementById('numero-parcelas');
    const caixaResultado = document.getElementById('resultado');
    const caixaErro = document.getElementById('mensagem-erro');
    
    // Elementos do Modal de Devolução
    const botaoAbrirDevolucao = document.getElementById('btnAbrirDevolucao');
    const modalDevolucao = document.getElementById('modalDevolucao');
    const botaoFecharDevolucao = document.getElementById('btnFecharDevolucao');
    const botaoCalcularDevolucao = document.getElementById('btnCalcularDevolucao');
    const botaoLimparDevolucao = document.getElementById('btnLimparDevolucao');
    const botaoAlternarMemoria = document.getElementById('btnToggleMemoria');
    
    // Entradas (Inputs) da Devolução
    const entradaGrupoCota = document.getElementById('dev-grupoCota'); 
    const entradaCredito = document.getElementById('dev-credito');
    const entradaPercentual = document.getElementById('dev-percentual');
    const entradaValorPago = document.getElementById('dev-valorPago');
    const selecaoDescontemplacao = document.getElementById('checkDescontemplacao');
    const caixaDescontemplacao = document.getElementById('boxDescontemplacao');
    const entradaCreditoGrupo = document.getElementById('dev-credito-grupo');
    const entradaCreditoCliente = document.getElementById('dev-credito-cliente');
    const caixaResultadoDevolucao = document.getElementById('dev-resultado');

    // Botões de Script de Atendimento
    const botaoScriptEmail = document.getElementById('btnScriptEmail');
    const botaoScriptWhatsapp = document.getElementById('btnScriptWhatsapp');
    const mensagemCopiado = document.getElementById('msg-copiado');

    // ==========================================================================
    //                 2. MANUAL DE UTILIZAÇÃO (RESTAURADO)
    // ==========================================================================
    const conteudoManual = document.getElementById('manual-conteudo');
    if (conteudoManual) {
        conteudoManual.innerHTML = `
            <div class="space-y-8 text-slate-700">
                
                <div>
                    <h4 class="font-bold text-lg text-slate-900 mb-3">1. Como realizar a Análise de Atraso</h4>
                    <p class="mb-3 text-sm">Preencha os campos para identificar o risco atual da cota:</p>
                    <ul class="list-disc pl-5 space-y-2 text-sm mb-4">
                        <li><strong>Status:</strong> Defina se o cliente já retirou o bem (Contemplado) ou não.</li>
                        <li><strong>Data de Inauguração:</strong> Fundamental para definir a regra de cancelamento (veja abaixo).</li>
                        <li><strong>Vencimento:</strong> Data da parcela mais antiga em aberto.</li>
                        <li><strong>Nº Parcelas:</strong> Quantidade total de parcelas pendentes.</li>
                    </ul>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900">
                        <strong>Resultado:</strong> O sistema informará se é caso de cobrança simples, cancelamento ou busca e apreensão (Para cotas com o crédito pago).
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-lg text-slate-900 mb-3">2. Regras de Cancelamento (Cláusula 39)</h4>
                    <p class="mb-3 text-sm">O sistema identifica automaticamente se a cota está em processo de exclusão baseando-se na data do grupo:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-gray-100 p-4 rounded-lg">
                            <p class="font-bold text-gray-800 text-sm mb-1">Grupos até 30/06/2024</p>
                            <p class="text-xs leading-relaxed">Cancelamento com <strong class="text-red-600">2 parcelas</strong> em atraso (consecutivas ou não).</p>
                        </div>
                        <div class="bg-gray-100 p-4 rounded-lg">
                            <p class="font-bold text-gray-800 text-sm mb-1">Grupos após 01/07/2024</p>
                            <p class="text-xs leading-relaxed">Cancelamento com <strong class="text-red-600">3 parcelas</strong> em atraso (consecutivas ou não).</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-lg text-slate-900 mb-3">3. Simulador para Devolução</h4>
                    <p class="mb-3 text-sm">Quando a análise identificar que a cota atingiu os critérios de cancelamento (Ex: Não Contemplada com 3 parcelas), aparecerá um botão: <strong class="text-red-600">"⚠️ Cota cancelou?"</strong>.</p>
                    
                    <p class="font-bold text-sm mb-2">Como é calculado o valor a devolver?</p>
                    <ul class="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>Base de Cálculo:</strong> Apenas o Fundo Comum pago (exclui Taxa Adm. e Seguro).</li>
                        <li><strong>Multa 1 (Cláusula 41.1):</strong> 10% fixo sobre o Fundo Comum (Prejuízo ao Grupo).</li>
                        <li><strong>Multa 2 (Cláusula 42 - Penal):</strong> Escalonada conforme o percentual pago:
                            <ul class="list-none pl-4 mt-1 space-y-1 text-xs text-slate-500 border-l-2 border-slate-300">
                                <li>• Até 20% pago: 20% multa</li>
                                <li>• 20,1% a 40%: 15% multa</li>
                                <li>• 40,1% a 50%: 10% multa</li>
                                <li>• Acima de 50%: Isento</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-lg text-slate-900 mb-3">4. Diferença de Descontemplação</h4>
                    <p class="mb-3 text-sm">Aplica-se a cotas <strong>Contempladas com Crédito Pendente</strong> que foram canceladas.</p>
                    <p class="mb-3 text-sm">No simulador, marque a opção <em>"A cota estava Contemplada?"</em>. O cálculo segue o <strong>Parágrafo 15</strong> da seção de Cancelamento da Contemplação:</p>
                    
                    <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 font-mono text-xs text-center shadow-sm">
                        Diferença = Crédito Atualizado do Grupo - (Crédito do Cliente + Rendimentos)
                    </div>
                    <p class="mt-2 text-xs text-slate-500">Se o crédito atual do grupo for maior, o consorciado deve pagar essa diferença para recompor o saldo do grupo.</p>
                </div>

            </div>
        `;
    }

    // Conteúdo do Acordeão (Base Legal)
    const containerAcordeao = document.getElementById('accordion-container');
    if (containerAcordeao) {
        containerAcordeao.innerHTML = `
            <div class="accordion-item">
                <button class="accordion-header" onclick="alternarAcordeaoDevolucao(this)">
                    Fundo Comum e Base Legal (Lei 11.795) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p>É a parte da parcela destinada à compra do bem (Art. 25). É o único valor passível de devolução ao excluído (Art. 30, Lei 11.795/08).</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header" onclick="alternarAcordeaoDevolucao(this)">
                    Por que taxas não são devolvidas? (Cláusula 41) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p>A Taxa de Administração, Fundo de Reserva e Seguro remuneram serviços já prestados e a proteção usufruída durante a vigência do contrato, não sendo reembolsáveis.</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header" onclick="alternarAcordeaoDevolucao(this)">
                    Entenda as Multas (Cláusulas 41.1 e 42) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p><strong>Cláusula 41.1 (10%):</strong> Indenização pelos prejuízos causados ao grupo.<br>
                    <strong>Cláusula 42 (Penal):</strong> Penalidade compensatória variável (0% a 20%) para cobrir custos de venda.</p>
                </div>
            </div>
        `;
    }

    // ==========================================================================
    //                    3. UTILITÁRIOS E MÁSCARAS
    // ==========================================================================

    // Máscara Data
    if (entradaDataVencimento) {
        entradaDataVencimento.addEventListener('input', (evento) => {
            let valor = evento.target.value.replace(/\D/g, '');
            if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
            if (valor.length > 5) valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            evento.target.value = valor;
        });
    }

    // Máscara Moeda
    window.mascaraMoeda = function(evento) {
        let valor = evento.target.value.replace(/\D/g, '');
        valor = (valor / 100).toFixed(2) + '';
        valor = valor.replace(".", ",");
        valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        evento.target.value = valor;
    };
    if(entradaCredito) entradaCredito.addEventListener('input', mascaraMoeda);
    if(entradaValorPago) entradaValorPago.addEventListener('input', mascaraMoeda);
    if(entradaCreditoGrupo) entradaCreditoGrupo.addEventListener('input', mascaraMoeda);
    if(entradaCreditoCliente) entradaCreditoCliente.addEventListener('input', mascaraMoeda);

    // Função auxiliar para converter moeda PT-BR para Float (Decimal)
    const converterMoeda = (valorTexto) => {
        if(!valorTexto) return 0;
        return parseFloat(valorTexto.replace(/\./g, '').replace(',', '.'));
    };

    // Função auxiliar para formatar Float para Moeda PT-BR
    const formatarMoeda = (valorNumerico) => valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


    // ==========================================================================
    //              4. LÓGICA DA CALCULADORA DE ATRASO (PRINCIPAL)
    // ==========================================================================

    function calcularAtraso() {
        caixaErro.textContent = '';
        caixaResultado.style.opacity = '0';

        const textoDataVencimento = entradaDataVencimento.value;
        const numeroParcelas = parseInt(entradaParcelas.value);
        let statusConsorciado = 'nao-contemplado';
        const radioStatus = document.querySelector('input[name="status-consorciado"]:checked');
        if (radioStatus) statusConsorciado = radioStatus.value;
        
        const ehInauguracaoAntiga = document.getElementById('data-ate-jun24').checked;

        if (textoDataVencimento.length !== 10) {
            caixaErro.textContent = 'Informe uma data válida (DD/MM/AAAA).';
            return;
        }
        if (!numeroParcelas || numeroParcelas < 1) {
            caixaErro.textContent = 'Informe o número de parcelas em aberto.';
            return;
        }

        const partesData = textoDataVencimento.split('/');
        const dataVencimento = new Date(partesData[2], partesData[1] - 1, partesData[0]);
        const dataHoje = new Date();
        const diferencaTempo = dataHoje - dataVencimento;
        const diasAtraso = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diasAtraso < 1) {
            caixaErro.textContent = 'A data de vencimento não indica atraso.';
            return;
        }

        let mensagemResultado = '';
        let corTexto = '';
        let acaoRecomendada = '';

        if (statusConsorciado === 'contemplado') {
            if (diasAtraso > 15 || numeroParcelas >= 2) {
                mensagemResultado = `🚨 <strong>RISCO JURÍDICO IMEDIATO!</strong><br>Cliente contemplado com ${diasAtraso} dias de atraso.`;
                acaoRecomendada = "Encaminhar para Jurídico/Cobrança urgente. Risco de Busca e Apreensão.";
                corTexto = 'text-red-600';
            } else {
                mensagemResultado = `⚠️ <strong>Atenção:</strong> Contemplado em atraso (${diasAtraso} dias).`;
                acaoRecomendada = "Realizar cobrança preventiva.";
                corTexto = 'text-orange-600';
            }
        } else {
            const limiteCancelamento = ehInauguracaoAntiga ? 2 : 3;
            
            if (numeroParcelas >= limiteCancelamento) {
                const textoRegra = ehInauguracaoAntiga ? "2 parcelas (Grupos até 06/24)" : "3 parcelas (Grupos pós 07/24)";
                mensagemResultado = `🚫 <strong>COTA EM PROCESSO DE CANCELAMENTO</strong><br>Atingiu o limite de ${textoRegra}.`;
                acaoRecomendada = "A cota será excluída por inadimplência (Cláusula 39). Verifique o cálculo de devolução.";
                corTexto = 'text-red-700';
            } else {
                mensagemResultado = `ℹ️ <strong>Cobrança Administrativa</strong><br>${diasAtraso} dias de atraso.`;
                acaoRecomendada = `Emitir boleto. O cancelamento ocorre com ${ehInauguracaoAntiga ? '2' : '3'} parcelas vencidas.`;
                corTexto = 'text-blue-600';
            }
        }

        caixaResultado.innerHTML = `
            <div class="${corTexto} font-bold mb-2 text-xl">${mensagemResultado}</div>
            <div class="text-slate-600 mt-2 text-sm">${acaoRecomendada}</div>
        `;
        caixaResultado.style.opacity = '1';

        verificarBotaoDevolucao(statusConsorciado, numeroParcelas, ehInauguracaoAntiga);
    }

    function verificarBotaoDevolucao(status, parcelas, isAntigo) {
        const limite = isAntigo ? 2 : 3;
        if (status === 'nao-contemplado' && parcelas >= limite) {
            botaoAbrirDevolucao.style.display = 'inline-block';
            setTimeout(() => {
                botaoAbrirDevolucao.style.opacity = '1';
                botaoAbrirDevolucao.style.transform = 'translateY(0)';
            }, 100);
        } else {
            botaoAbrirDevolucao.style.display = 'none';
        }
    }

    if (botaoCalcular) botaoCalcular.addEventListener('click', calcularAtraso);

    if (botaoZerar) {
        botaoZerar.addEventListener('click', () => {
            entradaDataVencimento.value = '';
            entradaParcelas.value = '';
            caixaResultado.style.opacity = '0';
            botaoAbrirDevolucao.style.display = 'none';
        });
    }

    // ==========================================================================
    //              5. LÓGICA DE DEVOLUÇÃO E CÁLCULOS
    // ==========================================================================

    // Descontemplação
    if (selecaoDescontemplacao) {
        selecaoDescontemplacao.addEventListener('change', (evento) => {
            if (evento.target.checked) {
                caixaDescontemplacao.classList.remove('hidden');
            } else {
                caixaDescontemplacao.classList.add('hidden');
                document.getElementById('res-descontemplacao').classList.add('hidden');
            }
        });
    }

    // Modal
    botaoAbrirDevolucao.addEventListener('click', (evento) => { evento.preventDefault(); modalDevolucao.style.display = 'flex'; });
    const funcaoFecharModal = () => { modalDevolucao.style.display = 'none'; };
    botaoFecharDevolucao.addEventListener('click', funcaoFecharModal);
    window.addEventListener('click', (evento) => { if (evento.target === modalDevolucao) funcaoFecharModal(); });

    // Memória de Cálculo
    if (botaoAlternarMemoria) {
        botaoAlternarMemoria.addEventListener('click', () => {
            const caixaMemoria = document.getElementById('memoriaCalculo');
            caixaMemoria.classList.toggle('hidden');
            botaoAlternarMemoria.innerHTML = caixaMemoria.classList.contains('hidden') ? 'Ver Memória de Cálculo ▼' : 'Ocultar Memória ▲';
        });
    }

    // Acordeão
    window.alternarAcordeaoDevolucao = function(cabecalho) {
        const conteudo = cabecalho.nextElementSibling;
        const seta = cabecalho.querySelector('span');
        document.querySelectorAll('.accordion-content').forEach(c => { if(c !== conteudo) c.classList.remove('open'); });
        
        if (conteudo.classList.contains('open')) {
            conteudo.classList.remove('open');
            seta.innerText = '▼';
        } else {
            conteudo.classList.add('open');
            seta.innerText = '▲';
        }
    };

    // --- CÁLCULO PRINCIPAL DA DEVOLUÇÃO ---
    if (botaoCalcularDevolucao) {
        botaoCalcularDevolucao.addEventListener('click', () => {
            try {
                const valorCredito = converterMoeda(entradaCredito.value);
                const valorPercentual = parseFloat((entradaPercentual.value || '0').replace(',', '.'));
                const valorTotalPago = converterMoeda(entradaValorPago.value);

                if (valorCredito === 0 || valorPercentual === 0 || valorTotalPago === 0) {
                    alert("Por favor, preencha todos os campos da simulação.");
                    return;
                }

                // 1. Descontemplação
                if (selecaoDescontemplacao.checked) {
                    const creditoGrupo = converterMoeda(entradaCreditoGrupo.value);
                    const creditoCliente = converterMoeda(entradaCreditoCliente.value);
                    
                    if (creditoGrupo > 0 && creditoCliente > 0) {
                        const diferencaValores = creditoGrupo - creditoCliente;
                        const divResultado = document.getElementById('res-descontemplacao');
                        
                        if (diferencaValores > 0) {
                            divResultado.classList.remove('hidden');
                            divResultado.className = "mb-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm font-bold block";
                            divResultado.innerHTML = `Diferença a Pagar (Descontemplação):<br><span class="text-lg">${formatarMoeda(diferencaValores)}</span>`;
                        } else {
                            divResultado.classList.remove('hidden');
                            divResultado.className = "mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-200 text-sm font-bold block";
                            divResultado.innerHTML = "Sem diferença a pagar (Crédito do cliente cobre o valor atual).";
                        }
                    }
                } else {
                    document.getElementById('res-descontemplacao').classList.add('hidden');
                }

                // 2. Devolução
                const valorFundoComum = valorCredito * (valorPercentual / 100);
                
                let valorTaxasRetidas = valorTotalPago - valorFundoComum;
                if(valorTaxasRetidas < 0) valorTaxasRetidas = 0;

                const multaPrejuizoGrupo = valorFundoComum * 0.10; // 10% fixo

                let taxaPenal = 0;
                if (valorPercentual <= 20) taxaPenal = 0.20;
                else if (valorPercentual <= 40) taxaPenal = 0.15;
                else if (valorPercentual <= 50) taxaPenal = 0.10;
                else taxaPenal = 0.00;
                
                const multaPenal = valorFundoComum * taxaPenal;
                const valorDevolucao = valorFundoComum - multaPrejuizoGrupo - multaPenal;

                // Preencher DOM (Tela)
                document.getElementById('dev-valorFinal').textContent = formatarMoeda(valorDevolucao);
                document.getElementById('memTotalPago').textContent = formatarMoeda(valorTotalPago);
                document.getElementById('memTaxasRetidas').textContent = '- ' + formatarMoeda(valorTaxasRetidas);
                document.getElementById('memFundoComum').textContent = formatarMoeda(valorFundoComum);
                document.getElementById('memValorClausula41').textContent = '- ' + formatarMoeda(multaPrejuizoGrupo);
                document.getElementById('memTaxaClausula42').textContent = (taxaPenal * 100) + '%';
                document.getElementById('memValorClausula42').textContent = '- ' + formatarMoeda(multaPenal);
                document.getElementById('memTotal').textContent = formatarMoeda(valorDevolucao);

                caixaResultadoDevolucao.style.display = 'block';
                caixaResultadoDevolucao.style.opacity = '0';
                setTimeout(() => caixaResultadoDevolucao.style.opacity = '1', 50);

            } catch (erro) {
                console.error(erro);
                alert("Erro ao calcular. Verifique os formatos (ex: 1.000,00).");
            }
        });
    }

    if (botaoLimparDevolucao) {
        botaoLimparDevolucao.addEventListener('click', () => {
            document.querySelectorAll('.dev-input').forEach(input => input.value = '');
            caixaResultadoDevolucao.style.display = 'none';
            document.getElementById('res-descontemplacao').classList.add('hidden');
            if(selecaoDescontemplacao) {
                selecaoDescontemplacao.checked = false;
                caixaDescontemplacao.classList.add('hidden');
            }
        });
    }

    // ==========================================================================
    //              6. GERADOR DE SCRIPT 
    // ==========================================================================

    const copiarScriptParaClipboard = (texto, nomeCanal) => {
        navigator.clipboard.writeText(texto).then(() => {
            mensagemCopiado.textContent = `Script copiado para ${nomeCanal}!`;
            mensagemCopiado.style.opacity = '1';
            setTimeout(() => { mensagemCopiado.style.opacity = '0'; }, 3000);
        }).catch(erro => {
            console.error('Erro ao copiar', erro);
            alert('Erro ao copiar texto. Permissão negada pelo navegador?');
        });
    };

    const obterDadosParaScript = () => {
        const valorCredito = converterMoeda(entradaCredito.value);
        if (valorCredito === 0) {
            alert("Por favor, realize o cálculo da devolução antes de gerar o script.");
            return null;
        }

        const nomeUsuario = '[Nome do Consorciado]';
        const textoGrupoCota = entradaGrupoCota.value || '____/____';
        const valorPercentual = parseFloat((entradaPercentual.value || '0').replace(',', '.'));
        
        const valorFundoComum = valorCredito * (valorPercentual / 100);
        const multaPrejuizoGrupo = valorFundoComum * 0.10;
        let taxaPenal = 0;
        
        // Regra de isenção de multa penal acima de 50%
        if (valorPercentual <= 20) taxaPenal = 0.20;
        else if (valorPercentual <= 40) taxaPenal = 0.15;
        else if (valorPercentual <= 50) taxaPenal = 0.10;
        else taxaPenal = 0.00;
        
        const multaPenal = valorFundoComum * taxaPenal;
        const totalMultaPercentual = 10 + (taxaPenal * 100);
        const valorDevolucao = valorFundoComum - multaPrejuizoGrupo - multaPenal;

        return {
            nomeUsuario,
            textoGrupoCota,
            valorCredito,
            valorPercentualStr: valorPercentual.toFixed(4).replace('.', ','), 
            valorPercentual,
            valorFundoComum,
            taxaPenal,
            totalMultaPercentual,
            valorDevolucao
        };
    };

    // --- SCRIPT PARA WHATSAPP ---
    if (botaoScriptWhatsapp) {
        botaoScriptWhatsapp.addEventListener('click', () => {
            const dados = obterDadosParaScript();
            if (!dados) return;

            const { nomeUsuario, textoGrupoCota, valorCredito, valorPercentualStr, valorFundoComum, taxaPenal, totalMultaPercentual, valorDevolucao, valorPercentual } = dados;

            // VARIÁVEL DE TEXTO DINÂMICA (SINGULAR/PLURAL e EXPLICAÇÃO)
            let textoExplicacaoMultas = "";
            let textoCalculoLinha2 = "";

            if (valorPercentual > 50) {
                // Caso > 50% (Apenas 1 multa)
                textoExplicacaoMultas = 
`No cancelamento do consórcio, houve a aplicação da multa contratual de 10% destinada ao grupo de consórcio, prevista para compensar o impacto da saída de um participante.
Como você contribuiu com mais de 50% do fundo comum, houve isenção da cláusula penal compensatória (administradora).`;

                textoCalculoLinha2 = `${formatarMoeda(valorFundoComum)} (FC) - 10% (Referente apenas ao prejuízo causado ao grupo)`;
            
            } else {
                // Caso <= 50% (Duas multas)
                textoExplicacaoMultas = 
`No cancelamento do consórcio, podem existir dois tipos de descontos previstos no regulamento:

O primeiro é uma multa de 10% que vai para o grupo de consórcio. Ela existe para compensar o impacto da saída de um participante para os demais.

O segundo é uma cláusula penal compensatória, prevista no Código Civil (artigo 416), que pode ser aplicada para cobrir custos operacionais já realizados pela administradora — como a venda da cota e a formação do grupo, e a remuneração de representantes e corretores`;

                textoCalculoLinha2 = `${formatarMoeda(valorFundoComum)} (FC) - ${totalMultaPercentual}% (Somando os 10% por prejudicar o grupo e os ${(taxaPenal*100)}% pela infração contratual [inadimplência das obrigações])`;
            }

            const textoWhatsapp = 
`Olá, ${nomeUsuario}, tudo bem?

Analisei o caso referente à cota ${textoGrupoCota}.

Como houveram parcelas em atraso, a cota seguiu para cancelamento conforme o regulamento (clausula 39).

Resumo dos Valores:

Crédito Base: ${formatarMoeda(valorCredito)}
Percentual Pago (Fundo Comum): ${valorPercentualStr}%

Cálculo da Devolução (Lei 11.795):
${textoExplicacaoMultas}

Cálculo:
Crédito Base: ${formatarMoeda(valorCredito)} * ${valorPercentualStr}% Percentual Pago (Fundo Comum)
${textoCalculoLinha2}

Resultado Estimado: ${formatarMoeda(valorDevolucao)}

Qualquer dúvida, estou à disposição!`;

            copiarScriptParaClipboard(textoWhatsapp, 'WhatsApp');
        });
    }

    // --- SCRIPT PARA E-MAIL ---
    if (botaoScriptEmail) {
        botaoScriptEmail.addEventListener('click', () => {
            const dados = obterDadosParaScript();
            if (!dados) return;

            const { nomeUsuario, textoGrupoCota, valorCredito, valorPercentualStr, valorPercentual, valorFundoComum, taxaPenal, totalMultaPercentual, valorDevolucao } = dados;
            
            // LÓGICA CONDICIONAL PARA O E-MAIL
            let blocoJuridicoMultas = "";
            let blocoAplicacaoMultas = "";
            let blocoResumoMultas = "";
            let blocoCalculoFinal = "";

            if (valorPercentual > 50) {
                // > 50% - SINGULAR
                blocoJuridicoMultas = 
`No cancelamento do consórcio, aplica-se a multa destinada ao grupo de consórcio, prevista na Cláusula 41.1, com fundamento no Art. 53, §2º do Código de Defesa do Consumidor e Lei 11.795/2008.
Sua finalidade é indenizar o grupo pelos prejuízos decorrentes da saída de um consorciado, mantendo o equilíbrio financeiro do grupo.`;

                blocoAplicacaoMultas = 
`Como contribuiu com um percentual maior que 50% ao fundo comum, a cláusula penal compensatória (administradora) foi isenta. Foi cobrada apenas a multa de 10% a título de prejuízos causados ao grupo.`;

                blocoResumoMultas = 
`• Multa contratual: 10% (Referente apenas ao prejuízo ao grupo)`;

                blocoCalculoFinal = 
`${formatarMoeda(valorFundoComum)} - 10% (Multa) = ${formatarMoeda(valorDevolucao)}`;

            } else {
                // <= 50% - PLURAL (DUAS MULTAS)
                blocoJuridicoMultas = 
`No cancelamento do consórcio, não estamos tratando de uma única multa, mas de duas penalidades distintas, cada uma com fundamento legal e finalidade própria.

1. Multa de 10% - destinada ao grupo de consórcio
- Previsão: Cláusula 41.1
- Fundamento legal: Art. 53, §2º do Código de Defesa do Consumidor e Lei 11.795/2008
- Finalidade: indenizar o grupo pelos prejuízos decorrentes da saída de um consorciado. Essa multa existe para manter o equilíbrio financeiro do grupo.

2. Cláusula penal compensatória (administradora)
- Previsão: Cláusula 42 e demais alineas "a", "b", "c" e "d"
- Fundamento legal: Art. 416 do Código Civil
- Finalidade: ressarcir a administradora por custos já realizados, como venda da cota, comissões e estrutura administrativa.

De forma geral, essas penalidades impactam o valor final, podendo somar até 30% conforme previsto no contrato. Isso não configura cobrança em duplicidade, pois cada multa possui um fato gerador diferente.`;

                blocoAplicacaoMultas = 
`Como contribuiu com um percentual ${valorPercentual <= 20 ? 'menor' : 'maior'} que 20% ao fundo comum, foi cobrada multa contratual total de ${totalMultaPercentual}%, sendo distribuída da seguinte forma:

• 10% a título de prejuízos causados ao grupo;

• ${taxaPenal * 100}% de infração contratual pela inadimplência.`;

                blocoResumoMultas = 
`• Multa contratual: ${totalMultaPercentual}% (10% por prejudicar o grupo + ${(taxaPenal * 100)}% pelo inadimplemento cláusulas 41.1 e 42)`;

                blocoCalculoFinal = 
`${formatarMoeda(valorFundoComum)} - ${totalMultaPercentual}% (Multas) = ${formatarMoeda(valorDevolucao)}`;
            }

            const textoEmail = 
`${nomeUsuario}, agradecemos o seu contato e a oportunidade em prestar os devidos esclarecimentos.

Recebemos o seu relato em que analisamos com toda a atenção merecida, observando que você firmou conosco contrato por adesão, objetivando a utilização do crédito no segmento de bens móveis/imóveis após a contemplação.

Antes de mais nada, ${nomeUsuario}, permita-me retomar alguns conceitos fundamentais.

Conforme estipula o Art. 2º da Lei nº 11.795/08, o consórcio é a união de pessoas em um grupo com prazo e número de cotas definidos, com o objetivo de permitir a aquisição de bens ou serviços de forma igualitária, por meio de autofinanciamento. Este autofinanciamento ocorre com a contribuição de cada participante para um capital comum, chamado de "fundo comum".

E o que seria o chamado fundo comum? De acordo com o Art.25 da citada lei:

"Considera-se fundo comum, para os fins desta Lei, os recursos do grupo destinados à atribuição de crédito aos consorciados contemplados para aquisição do bem ou serviço e à restituição aos consorciados excluídos dos respectivos grupos, bem como para outros pagamentos previstos no contrato de participação em grupo de consórcio, por adesão."

E como se constitui esse fundo comum, afinal? Ai podemos verificar a definição no próprio Art.25, em seu paragrafo único. Confira abaixo:

"Parágrafo único. O fundo comum é constituído pelo montante de recursos representados por prestações pagas pelos consorciados para esse fim e por valores correspondentes a multas e juros moratórios destinados ao grupo de consórcio, bem como pelos rendimentos provenientes de sua aplicação financeira."

Estando ciente do que é o fundo comum - que é fundamental para o entendimento das próximas linhas - vamos agora entender mais sobre o grupo de consórcio.

Este grupo, ${nomeUsuario}, de acordo com o Art. 3º da mesma lei, funciona como uma sociedade não personificada promovendo o autofinanciamento, ou seja, um fundo com patrimônio próprio que não se mistura com o da administradora. É essencial compreender que, no Sistema de Consórcios, o interesse coletivo do grupo prevalece sobre o interesse individual de um único consorciado, conforme estipula o artigo 3º, § 2º da Lei nº 11.795/08. Por isso, a gestão dos recursos é feita de modo a garantir que todos os membros alcancem seus objetivos.

Dado o contexto acima, ${nomeUsuario}, no que se refere a sua cota, observamos que até o momento do cancelamento totalizou o pagamento de XX parcelas, totalizando um percentual contribuído ao fundo comum de ${valorPercentualStr}%, o que caracterizou infração contratual, conforme cláusulas que seguem:

' Cláusula 38 - Antes da contemplação, o CONSORCIADO que solicitar formalmente o seu desligamento do grupo, será considerado EXCLUÍDO.

Cláusula 39 - O CONSORCIADO não contemplado que deixar de realizar as suas contribuições mensais por 3 (três) vezes consecutivas ou alternadas, será excluído do grupo, independentemente de aviso ou notificação. '

${blocoJuridicoMultas}

Além disso, ${nomeUsuario}, dos valores pago na cota, você contribuiu nas parcelas com taxa administrativa, fundo de reserva, e o valor sobre o crédito que chamamos de fundo comum (lembra-se?). No entanto, no cálculo de devolução não entra para devolução a taxa de administração, pois é o serviço prestado pela administração de sua cota e ao fundo de reserva, que é uma reserva técnica do grupo para proteger contra inadimplência. Essa informação também é prevista na Lei 11.795, Art. 30:

" Art. 30.  O consorciado excluído não contemplado terá direito à restituição da importância paga ao fundo comum do grupo, cujo valor deve ser calculado com base no percentual amortizado do valor do bem ou serviço vigente na data da assembléia de contemplação, acrescido dos rendimentos da aplicação financeira a que estão sujeitos os recursos dos consorciados enquanto não utilizados pelo participante, na forma do art. 24, § 1o. "

${blocoAplicacaoMultas}

Para melhor apreciação você também poderá consultar as cláusulas do regulamento (em anexo) que tratam do assunto (Cláusulas 40, 40.1, 41, 41.1 e 42).

Dado o contexto acima, ${nomeUsuario}, vamos aos cálculos da devolução dos valores referente ao grupo e cota ${textoGrupoCota}.

• Valor do crédito base: ${formatarMoeda(valorCredito)}
• Percentual pago ao fundo comum: ${valorPercentualStr}% (que já desconta as taxas administrativas)
${blocoResumoMultas}

Calculando esses valores:
${formatarMoeda(valorCredito)} * ${valorPercentualStr}% = ${formatarMoeda(valorFundoComum)} (Valor pago ao Fundo Comum)
${blocoCalculoFinal}

Cabe ressaltar que a administradora pauta sua atuação na mais estrita observância à legislação vigente, em especial à Lei nº 11.795/2008 (Lei dos Consórcios), à Circular Bacen nº 3.432/2009 - ou resolução 285 [vide a normativa do grupo], ao Código de Defesa do Consumidor (Lei nº 8.078/1990) e às cláusulas expressas no regulamento.`;

            copiarScriptParaClipboard(textoEmail, 'E-mail');
        });
    }

});