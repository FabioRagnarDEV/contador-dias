document.addEventListener('DOMContentLoaded', () => {

    const botaoCalcular = document.getElementById('calcular-btn');
    const botaoZerar = document.getElementById('reset-btn');
    const entradaDataVencimento = document.getElementById('data-vencimento');
    const entradaParcelas = document.getElementById('numero-parcelas');
    const caixaResultado = document.getElementById('resultado');
    const caixaErro = document.getElementById('mensagem-erro');

    const botaoAbrirDevolucao = document.getElementById('btnAbrirDevolucao');
    const modalDevolucao = document.getElementById('modalDevolucao');
    const botaoFecharDevolucao = document.getElementById('btnFecharDevolucao');
    const botaoCalcularDevolucao = document.getElementById('btnCalcularDevolucao');
    const botaoLimparDevolucao = document.getElementById('btnLimparDevolucao');
    const botaoAlternarMemoria = document.getElementById('btnToggleMemoria');

    const entradaGrupoCota = null; // campo removido — dado sensível
    const entradaCredito = document.getElementById('dev-credito');
    const entradaPercentual = document.getElementById('dev-percentual');
    const entradaValorPago = document.getElementById('dev-valorPago');
    const selecaoDescontemplacao = document.getElementById('checkDescontemplacao');
    const caixaDescontemplacao = document.getElementById('boxDescontemplacao');
    const entradaCreditoGrupo = document.getElementById('dev-credito-grupo');
    const entradaCreditoCliente = document.getElementById('dev-credito-cliente');
    const caixaResultadoDevolucao = document.getElementById('dev-resultado');

    const botaoScriptEmail = document.getElementById('btnScriptEmail');
    const botaoScriptWhatsapp = document.getElementById('btnScriptWhatsapp');
    const mensagemCopiado = document.getElementById('msg-copiado');


    if (entradaDataVencimento) {
        entradaDataVencimento.addEventListener('input', (evento) => {
            let valor = evento.target.value.replace(/\D/g, '');
            if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
            if (valor.length > 5) valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            evento.target.value = valor;
        });
    }

    window.mascaraMoeda = function(evento) {
        let valor = evento.target.value.replace(/\D/g, '');
        valor = (valor / 100).toFixed(2) + '';
        valor = valor.replace(".", ",");
        valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        evento.target.value = valor;
    };
    if (entradaCredito) entradaCredito.addEventListener('input', mascaraMoeda);
    if (entradaValorPago) entradaValorPago.addEventListener('input', mascaraMoeda);
    if (entradaCreditoGrupo) entradaCreditoGrupo.addEventListener('input', mascaraMoeda);
    if (entradaCreditoCliente) entradaCreditoCliente.addEventListener('input', mascaraMoeda);

    const converterMoeda = (valorTexto) => {
        if (!valorTexto) return 0;
        return parseFloat(valorTexto.replace(/\./g, '').replace(',', '.'));
    };

    const formatarMoeda = (valorNumerico) => valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const parseDataBrasileiraEstrita = (valorTexto) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valorTexto)) return null;
        const [diaTexto, mesTexto, anoTexto] = valorTexto.split('/');
        const dia = Number(diaTexto);
        const mes = Number(mesTexto);
        const ano = Number(anoTexto);
        if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(ano)) return null;
        if (mes < 1 || mes > 12) return null;
        const data = new Date(ano, mes - 1, dia);
        if (data.getFullYear() !== ano || data.getMonth() !== (mes - 1) || data.getDate() !== dia) return null;
        data.setHours(0, 0, 0, 0);
        return data;
    };

    const obterHojeSemHora = () => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return hoje;
    };


    function calcularAtraso() {
        caixaErro.textContent = '';
        caixaResultado.style.opacity = '0';
        caixaResultado.className = "text-center p-4 rounded-lg transition-all duration-300 opacity-0 mt-4";

        const textoDataVencimento = entradaDataVencimento.value;
        const numeroParcelas = parseInt(entradaParcelas.value);
        let statusConsorciado = 'nao-contemplado';
        const radioStatus = document.querySelector('input[name="status-consorciado"]:checked');
        if (radioStatus) statusConsorciado = radioStatus.value;

        const ehInauguracaoAntiga = document.getElementById('data-ate-jun24').checked;

        const dataVencimento = parseDataBrasileiraEstrita(textoDataVencimento);
        if (!dataVencimento) {
            caixaErro.textContent = 'Informe uma data válida (DD/MM/AAAA).';
            return;
        }
        if (!numeroParcelas || numeroParcelas < 1) {
            caixaErro.textContent = 'Informe o número de parcelas em aberto.';
            return;
        }

        const dataHoje = obterHojeSemHora();
        const resultadoAtraso = ConsorcioService.analisarAtraso(dataVencimento, dataHoje, numeroParcelas, statusConsorciado, ehInauguracaoAntiga);

        if (resultadoAtraso.erro) {
            caixaErro.textContent = resultadoAtraso.erro;
            return;
        }

        caixaResultado.textContent = '';
        caixaResultado.className = `text-center p-5 rounded-lg transition-all duration-300 shadow-sm mt-4 ${resultadoAtraso.corFundo}`;

        const divTitulo = document.createElement('div');
        divTitulo.className = `${resultadoAtraso.cor} font-extrabold mb-1 text-xl flex items-center justify-center gap-2`;
        divTitulo.textContent = `${resultadoAtraso.icone} ${resultadoAtraso.titulo}`;

        const divDescricao = document.createElement('div');
        divDescricao.className = `${resultadoAtraso.cor} font-semibold mb-3 text-base`;
        divDescricao.textContent = resultadoAtraso.descricao;

        const divAcao = document.createElement('div');
        divAcao.className = "text-slate-700 bg-white/60 p-2 rounded text-sm font-medium border border-white/40 inline-block";
        divAcao.textContent = resultadoAtraso.acao;

        caixaResultado.appendChild(divTitulo);
        caixaResultado.appendChild(divDescricao);
        caixaResultado.appendChild(divAcao);
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

    let ultimoFocoDevolucao = null;
    const obterFocaveisDevolucao = () => modalDevolucao.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const capturarTabNoModalDevolucao = (evento) => {
        if (evento.key !== 'Tab' || modalDevolucao.getAttribute('aria-hidden') !== 'false') return;
        const focaveis = obterFocaveisDevolucao();
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    };

    const abrirModalDevolucao = () => {
        ultimoFocoDevolucao = document.activeElement;
        modalDevolucao.style.display = 'flex';
        modalDevolucao.setAttribute('aria-hidden', 'false');
        botaoAbrirDevolucao.setAttribute('aria-expanded', 'true');
        setTimeout(() => botaoFecharDevolucao.focus(), 20);
        document.addEventListener('keydown', capturarTabNoModalDevolucao);
    };

    const funcaoFecharModal = () => {
        modalDevolucao.style.display = 'none';
        modalDevolucao.setAttribute('aria-hidden', 'true');
        botaoAbrirDevolucao.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', capturarTabNoModalDevolucao);
        if (ultimoFocoDevolucao && typeof ultimoFocoDevolucao.focus === 'function') {
            ultimoFocoDevolucao.focus();
        }
    };

    botaoAbrirDevolucao.addEventListener('click', (evento) => {
        evento.preventDefault();
        abrirModalDevolucao();
    });
    botaoFecharDevolucao.addEventListener('click', funcaoFecharModal);
    window.addEventListener('click', (evento) => { if (evento.target === modalDevolucao) funcaoFecharModal(); });
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && modalDevolucao.getAttribute('aria-hidden') === 'false') {
            funcaoFecharModal();
        }
    });

    if (botaoAlternarMemoria) {
        botaoAlternarMemoria.addEventListener('click', () => {
            const caixaMemoria = document.getElementById('memoriaCalculo');
            caixaMemoria.classList.toggle('hidden');
            botaoAlternarMemoria.innerHTML = caixaMemoria.classList.contains('hidden') ? 'Ver Memória de Cálculo ▼' : 'Ocultar Memória ▲';
        });
    }

    window.alternarAcordeaoDevolucao = function(cabecalho) {
        const conteudo = cabecalho.nextElementSibling;
        const seta = cabecalho.querySelector('span');
        document.querySelectorAll('.accordion-content').forEach(c => { if (c !== conteudo) c.classList.remove('open'); });
        if (conteudo.classList.contains('open')) {
            conteudo.classList.remove('open');
            seta.innerText = '▼';
        } else {
            conteudo.classList.add('open');
            seta.innerText = '▲';
        }
    };

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

                if (selecaoDescontemplacao.checked) {
                    const creditoGrupo = converterMoeda(entradaCreditoGrupo.value);
                    const creditoCliente = converterMoeda(entradaCreditoCliente.value);
                    const divResultado = document.getElementById('res-descontemplacao');

                    if (creditoGrupo > 0 && creditoCliente > 0) {
                        const diferencaValores = ConsorcioService.calcularDescontemplacao(creditoGrupo, creditoCliente);
                        divResultado.classList.remove('hidden');
                        divResultado.textContent = '';

                        if (diferencaValores > 0) {
                            divResultado.className = "mb-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm font-bold block";
                            const textoDescontemplacao = document.createTextNode("Diferença a Pagar (Descontemplação): ");
                            const quebraLinha = document.createElement('br');
                            const spanValor = document.createElement('span');
                            spanValor.className = "text-lg";
                            spanValor.textContent = formatarMoeda(diferencaValores);
                            divResultado.appendChild(textoDescontemplacao);
                            divResultado.appendChild(quebraLinha);
                            divResultado.appendChild(spanValor);
                        } else {
                            divResultado.className = "mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-200 text-sm font-bold block";
                            divResultado.textContent = "Sem diferença a pagar (Crédito do cliente cobre o valor atual).";
                        }
                    }
                } else {
                    document.getElementById('res-descontemplacao').classList.add('hidden');
                }

                const resultado = ConsorcioService.calcularDevolucao(valorCredito, valorPercentual, valorTotalPago);

                document.getElementById('dev-valorFinal').textContent = formatarMoeda(resultado.valorDevolucao);
                document.getElementById('memTotalPago').textContent = formatarMoeda(valorTotalPago);
                document.getElementById('memTaxasRetidas').textContent = '- ' + formatarMoeda(resultado.valorTaxasRetidas);
                document.getElementById('memFundoComum').textContent = formatarMoeda(resultado.valorFundoComum);
                document.getElementById('memValorClausula41').textContent = '- ' + formatarMoeda(resultado.multaPrejuizoGrupo);
                document.getElementById('memTaxaClausula42').textContent = (resultado.taxaPenal * 100) + '%';
                document.getElementById('memValorClausula42').textContent = '- ' + formatarMoeda(resultado.multaPenal);
                document.getElementById('memTotal').textContent = formatarMoeda(resultado.valorDevolucao);

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
            if (selecaoDescontemplacao) {
                selecaoDescontemplacao.checked = false;
                caixaDescontemplacao.classList.add('hidden');
            }
        });
    }


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
        const textoGrupoCota = '[GRUPO E COTA]';
        const valorPercentual = parseFloat((entradaPercentual.value || '0').replace(',', '.'));
        const valorTotalPago = converterMoeda(entradaValorPago.value);
        const res = ConsorcioService.calcularDevolucao(valorCredito, valorPercentual, valorTotalPago);
        const totalMultaPercentual = 10 + (res.taxaPenal * 100);

        return {
            nomeUsuario,
            textoGrupoCota,
            valorCredito,
            valorPercentualStr: valorPercentual.toFixed(4).replace('.', ','),
            valorPercentual,
            valorFundoComum: res.valorFundoComum,
            taxaPenal: res.taxaPenal,
            totalMultaPercentual,
            valorDevolucao: res.valorDevolucao
        };
    };

    if (botaoScriptWhatsapp) {
        botaoScriptWhatsapp.addEventListener('click', () => {
            try {
                const dados = obterDadosParaScript();
                if (!dados) return;

                const { nomeUsuario, textoGrupoCota, valorCredito, valorPercentualStr, valorFundoComum, taxaPenal, totalMultaPercentual, valorDevolucao, valorPercentual } = dados;

                let textoExplicacaoMultas = "";
                let textoCalculoLinha2 = "";

                if (valorPercentual > 50) {
                    textoExplicacaoMultas =
`No cancelamento do consórcio, houve a aplicação da multa contratual de 10% destinada ao grupo de consórcio, prevista para compensar o impacto da saída de um participante.
Como você contribuiu com mais de 50% do fundo comum, houve isenção da cláusula penal compensatória (administradora).`;
                    textoCalculoLinha2 = `${formatarMoeda(valorFundoComum)} (FC) - 10% (Referente apenas ao prejuízo causado ao grupo)`;
                } else {
                    textoExplicacaoMultas =
`No cancelamento do consórcio, podem existir dois tipos de descontos previstos no regulamento:

O primeiro é uma multa de 10% que vai para o grupo de consórcio. Ela existe para compensar o impacto da saída de um participante para os demais.

O segundo é uma cláusula penal compensatória, prevista no Código Civil (artigo 416), que pode ser aplicada para cobrir custos operacionais já realizados pela administradora — como a venda da cota e a formação do grupo, e a remuneração de representantes e corretores`;
                    textoCalculoLinha2 = `${formatarMoeda(valorFundoComum)} (FC) - ${totalMultaPercentual}% (Somando os 10% por prejudicar o grupo e os ${(taxaPenal * 100)}% pela infração contratual [inadimplência das obrigações])`;
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
            } catch (erro) {
                console.error('Erro ao gerar script WhatsApp:', erro);
                alert('Erro ao gerar script. Verifique se o cálculo foi realizado corretamente.');
            }
        });
    }

    if (botaoScriptEmail) {
        botaoScriptEmail.addEventListener('click', () => {
            try {
                const dados = obterDadosParaScript();
                if (!dados) return;

                const { nomeUsuario, textoGrupoCota, valorCredito, valorPercentualStr, valorPercentual, valorFundoComum, taxaPenal, totalMultaPercentual, valorDevolucao } = dados;

                let blocoJuridicoMultas = "";
                let blocoAplicacaoMultas = "";
                let blocoResumoMultas = "";
                let blocoCalculoFinal = "";

                if (valorPercentual > 50) {
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
            } catch (erro) {
                console.error('Erro ao gerar script de e-mail:', erro);
                alert('Erro ao gerar script. Verifique se o cálculo foi realizado corretamente.');
            }
        });
    }

});
