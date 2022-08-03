const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Projeto')
require('../model/Pessoa')
require('../model/Cliente')
require('../model/Equipe')
require('../model/Empresa')
require('../model/Mensagem')

const Projeto = mongoose.model('projeto')
const Pessoa = mongoose.model('pessoa')
const Cliente = mongoose.model('cliente')
const Equipe = mongoose.model('equipe')
const Empresa = mongoose.model('empresa')
const Mensagem = mongoose.model('mensagem')

const pegames = require('../resources/pegames')
const dataBusca = require('../resources/dataBusca')
const dataMensagem = require('../resources/dataMensagem')
const dataHoje = require('../resources/dataHoje')
const filtrarProjeto = require('../resources/filtrar')
const naoVazio = require('../resources/naoVazio')
const { ehAdmin } = require('../helpers/ehAdmin')
const dataMsgNum = require('../resources/dataMsgNum')
const dataInput = require('../resources/dataInput')
const mascaraDecimal = require('../resources/mascaraDecimal')
const comparaNum = require('../resources/comparaNumeros')

router.get('/consulta', ehAdmin, (req, res) => {
    var id
    var sql_prj = []
    var sql_pes = []
    const { _id } = req.user
    const { user } = req.user
    const { pessoa } = req.user
    const { orcamentista } = req.user
    const { instalador } = req.user
    const { vendedor } = req.user
    const { funges } = req.user

    if (naoVazio(user)) {
        id = user
    } else {
        id = _id
    }

    if (funges || orcamentista || naoVazio(user) == false) {
        sql_prj = { user: id }
        sql_pes = { user: id, vendedor: 'checked' }
    }

    var lista = []
    var q = 0
    var dtcadastro = '00000000'
    var dtinicio = '0000-00-00'
    var dtfim = '0000-00-00'
    var nome_vendedor
    var valor = 0
    var total = 0

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, vendedor: 'checked' }).lean().then((todos_vendedores) => {
            Projeto.find({ user: id }).sort({ 'data': -1 }).then((projeto) => {
                if (naoVazio(projeto)) {
                    projeto.forEach((e) => {
                        Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                            Pessoa.findOne({ _id: e.vendedor }).then((vendedor) => {
                                q++
                                //console.log('e.datacad=>' + e.datacad)
                                if (naoVazio(e.datacad)) {
                                    dtcadastro = e.datacad
                                } else {
                                    dtcadastro = '00000000'
                                }

                                if (naoVazio(e.dtinicio)) {
                                    dtinicio = e.dtinicio
                                } else {
                                    dtinicio = '0000-00-00'
                                }

                                if (naoVazio(e.dtfim)) {
                                    dtfim = e.dtfim
                                } else {
                                    dtfim = '0000-00-00'
                                }

                                if (naoVazio(vendedor)) {
                                    nome_vendedor = vendedor.nome
                                } else {
                                    nome_vendedor = ''
                                }
                                if (naoVazio(e.valor)) {
                                    total = total + e.valor
                                    valor = e.valor
                                } else {
                                    valor = 0
                                }

                                lista.push({ s: e.status, id: e._id, seq: e.seq, uf: e.uf, cidade: e.cidade, valor: mascaraDecimal(valor), cliente: cliente.nome, nome_vendedor, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })

                                if (q == projeto.length) {
                                    lista.sort(comparaNum)
                                    res.render('principal/consulta', { qtd: q, lista, todos_clientes, todos_vendedores, total: mascaraDecimal(total), mostrar: 'none' })
                                }

                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum vendedor encontrado.')
                                res.redirect('/dashboard')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum cliente encontrado.')
                            res.redirect('/dashboard')
                        })
                    })
                } else {
                    res.render('principal/consulta', { lista, todos_clientes, todos_vendedores, mostrar: 'none' })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma projeto encontrada.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum responsável encontrado.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrada.')
        res.redirect('/dashboard')
    })
})

router.get('/consulta/:tipo', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var listaOrcado = []
    var listaAberto = []
    var listaEncerrado = []
    var listaBaixado = []
    var dtcadastro = '00000000'
    var responsavel = ''
    var nome_insres = ''
    var q = 0

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Projeto.find({ user: id }).sort({ 'data': -1 }).then((projeto) => {
                    if (projeto != '') {
                        projeto.forEach((e) => {
                            Cliente.findOne({ _id: e.cliente }).then((lista_cliente) => {
                                Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                    Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                                        Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                            q++
                                            if (naoVazio(e.datacad)) {
                                                dtcadastro = e.datacad
                                            } else {
                                                dtcadastro = '00000000'
                                            }

                                            if (naoVazio(lista_responsavel)) {
                                                responsavel = lista_responsavel.nome
                                            } else {
                                                responsavel = ''
                                            }
                                            //console.log('resposanvel1=>' + responsavel)

                                            if (naoVazio(insres)) {
                                                nome_insres = insres.nome
                                            } else {
                                                nome_insres = ''
                                            }
                                            //console.log('nome_insres=>' + nome_insres)
                                            //console.log('resposanvel2=>' + responsavel)
                                            if (e.baixada == true) {
                                                listaBaixado.push({ id: e._id, seq: e.seq, motivo: e.motivo, dtbaixa: dataMensagem(e.dtbaixa), cliente: lista_cliente.nome, responsavel, cadastro: dataMsgNum(dtcadastro) })
                                            } else {
                                                if (e.feito == true && e.ganho == false && e.encerrado == false) {
                                                    listaOrcado.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                } else {
                                                    if (e.feito == true && e.ganho == true && e.encerrado == false) {
                                                        listaAberto.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                    } else {
                                                        listaEncerrado.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                    }
                                                }
                                            }

                                            //console.log('q=>' + q)
                                            //console.log('req.params.tipo=>' + req.params.tipo)
                                            if (q == projeto.length) {
                                                if (req.params.tipo == 'baixado') {
                                                    res.render('principal/consulta', { listaBaixado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'baixado', titulo: ': Projeto Baixas' })
                                                } else {
                                                    if (req.params.tipo == 'orcado') {
                                                        res.render('principal/consulta', { listaOrcado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Propostas Enviadas' })
                                                    } else {
                                                        if (req.params.tipo == 'aberto') {
                                                            res.render('principal/consulta', { listaAberto, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'aberto', titulo: ': Em Aberto' })
                                                        } else {
                                                            res.render('principal/consulta', { listaEncerrado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'encerrado', titulo: ': Encerrado' })
                                                        }
                                                    }
                                                }
                                            }

                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                            res.redirect('/dashboard')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum gestor responsável encontrado.')
                                        res.redirect('/dashboard')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhumaa equipe encontrada.')
                                    res.redirect('/dashboard')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma cliente encontrado.')
                                res.redirect('/dashboard')
                            })
                        })
                    } else {
                        if (req.params.tipo == 'orcado') {
                            res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Orçamentos Enviados' })
                        } else {
                            if (req.params.tipo == 'aberto') {
                                res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'aberto', titulo: ': Em Aberto' })
                            } else {
                                res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'encerrado', titulo: ': Encerrado' })
                            }
                        }
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma projeto encontrado<todas>')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma empresa encontrada.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum responsável encontrado.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrado.')
        res.redirect('/dashboard')
    })
})

router.get('/analiseproposta', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    // var lista_envio = []
    var lista_ganho = []
    var lista_naoganho = []
    var lista_preco = []
    var lista_prazo = []
    var lista_finan = []
    var lista_conco = []
    var lista_smoti = []
    var lista_negoc = []
    var lista_anali = []
    var lista_compa = []
    var lista_reduc = []
    var lista_envia = []
    var venGanhoTotal = []
    var venNaoGanhoTotal = []
    var soma = 0
    // var qtd_ganho = []
    // var qtd_naoganho = []
    // var qtd_envio = []
    // var qtd_preco = []
    // var qtd_prazo = []
    // var qtd_finan = []
    // var qtd_conco = []
    // var qtd_smoti = []    
    var q = 0
    var x = 0

    var totalGanho = 0
    var totalNaoGanho = 0
    var totalEnviado = 0
    var totalNegociando = 0
    var totalPerdido = 0
    var totalAberto = 0
    var totalPreco = 0
    var totalPrazo = 0
    var totalFinan = 0
    var totalNegoc = 0
    var totalConco = 0
    var totalSmoti = 0
    var totalAnali = 0
    var totalCompa = 0
    var totalReduc = 0
    var total 

    var baixado
    var dataini
    var datafim
    var dtinicio
    var dtfim
    var mestitulo
    var hoje = dataHoje()
    var meshoje = hoje.substring(5, 7)
    var anotitulo = hoje.substring(0, 4)

    console.log('meshoje=>' + meshoje)

    switch (meshoje) {
        case '01':
            dataini = anotitulo + '01' + '01'
            datafim = anotitulo + '01' + '31'
            mestitulo = 'Janeiro '
            break;
        case '02':
            dataini = anotitulo + '02' + '01'
            datafim = anotitulo + '02' + '28'
            mestitulo = 'Fevereiro '
            break;
        case '03':
            dataini = anotitulo + '03' + '01'
            datafim = anotitulo + '03' + '31'
            mestitulo = 'Março '
            break;
        case '04':
            dataini = anotitulo + '04' + '01'
            datafim = anotitulo + '04' + '30'
            mestitulo = 'Abril '
            break;
        case '05':
            dataini = anotitulo + '05' + '01'
            datafim = anotitulo + '05' + '31'
            mestitulo = 'Maio '
            break;
        case '06':
            dataini = anotitulo + '06' + '01'
            datafim = anotitulo + '06' + '30'
            mestitulo = 'Junho '
            break;
        case '07':
            dataini = anotitulo + '07' + '01'
            datafim = anotitulo + '07' + '31'
            mestitulo = 'Julho '
            break;
        case '08':
            dataini = anotitulo + '08' + '01'
            datafim = anotitulo + '08' + '30'
            mestitulo = 'Agosto '
            break;
        case '09':
            dataini = anotitulo + '09' + '01'
            datafim = anotitulo + '09' + '31'
            mestitulo = 'Setembro '
            break;
        case '10':
            dataini = anotitulo + '10' + '01'
            datafim = anotitulo + '10' + '31'
            mestitulo = 'Outubro '
            break;
        case '11':
            dataini = anotitulo + '11' + '01'
            datafim = anotitulo + '11' + '30'
            mestitulo = 'Novembro '
            break;
        case '12':
            dataini = anotitulo + '12' + '01'
            datafim = anotitulo + '12' + '31'
            mestitulo = 'Dezembro '
            break;
        default:
            dataini = anotitulo + '01' + '01'
            datafim = anotitulo + '12' + '31'
            mestitulo = 'Todo ano '
    }
    console.log('dataini=>' + dataini)
    console.log('datafim=>' + datafim)

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Projeto.find({ user: id, datacad: { $lte: datafim, $gte: dataini } }).then((projeto) => {
            console.log('projeto=>' + projeto)
            if (naoVazio(projeto)) {
                Pessoa.find({ user: id, vendedor: 'checked' }).lean().then((pessoa) => {
                    pessoa.forEach((e) => {
                        console.log('e.nome=>'+e.nome)
                        Projeto.find({ user: id, vendedor: e._id, datacad: { $lte: datafim, $gte: dataini } }).then((pr) => {
                            console.log('pr.length=>'+pr.length)
                            if (pr.length > 0) {
                                pr.forEach((p) => {
                                    q++
                                    if (p.baixada == true) {
                                        baixado = 'Sim'
                                    } else {
                                        baixado = 'Não'
                                    }

                                    if (naoVazio(p.dtinicio)) {
                                        dtinicio = p.dtinicio
                                    } else {
                                        dtinicio = '0000-00-00'
                                    }

                                    if (naoVazio(p.dtfim)) {
                                        dtfim = p.dtfim
                                    } else {
                                        dtfim = '0000-00-00'
                                    }
                                    if (naoVazio(p.motivo) && p.baixada == true) {
                                        if (naoVazio(p.valor)) {
                                            totalPerdido = totalPerdido + p.valor
                                        }
                                        if (p.motivo == 'Fechou com concorrente') {
                                            lista_conco.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                            if (naoVazio(p.valor)) {
                                                totalConco = totalConco + p.valor
                                            }
                                        }
                                        if (p.motivo == 'Não conseguiu o financiamento') {
                                            lista_finan.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                            if (naoVazio(p.valor)) {
                                                totalFinan = totalFinan + p.valor
                                            }
                                        }
                                        if (p.motivo == 'Preço elevado') {
                                            lista_preco.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                            if (naoVazio(p.valor)) {
                                                totalPreco = totalPreco + p.valor
                                            }
                                        }
                                        if (p.motivo == 'Prazo de instalação') {
                                            lista_prazo.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                            if (naoVazio(p.valor)) {
                                                totalPrazo = totalPrazo + p.valor
                                            }
                                        }
                                        if (p.motivo == 'Sem motivo') {
                                            lista_smoti.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                            if (naoVazio(p.valor)) {
                                                totalSmoti = totalSmoti + p.valor
                                            }
                                        }
                                    } else {
                                        if (naoVazio(p.status) && p.ganho == false) {
                                            // if (naoVazio(p.valor)) {
                                            //     totalAberto = totalAberto + p.valor 
                                            // }
                                            if (p.status == 'Enviado') {
                                                lista_envia.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                if (naoVazio(p.valor)) {
                                                    totalEnviado = totalEnviado + p.valor
                                                }
                                            }
                                            if (p.status == 'Negociando') {
                                                lista_negoc.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                if (naoVazio(p.valor)) {
                                                    totalNegoc = totalNegoc + p.valor
                                                    totalNegociando = totalNegociando + p.valor
                                                }
                                            }
                                            if (p.status == 'Analisando Financiamento') {
                                                lista_anali.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                if (naoVazio(p.valor)) {
                                                    totalAnali = totalAnali + p.valor
                                                    totalNegociando = totalNegociando + p.valor
                                                }
                                            }
                                            if (p.status == 'Comparando Propostas') {
                                                lista_compa.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                if (naoVazio(p.valor)) {
                                                    totalCompa = totalCompa + p.valor
                                                    totalNegociando = totalNegociando + p.valor
                                                }
                                            }
                                            if (p.status == 'Aguardando redução de preço') {
                                                lista_reduc.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                if (naoVazio(p.valor)) {
                                                    totalReduc = totalReduc + p.valor
                                                    totalNegociando = totalNegociando + p.valor
                                                }
                                            }
                                            totalAberto = totalNegociando + totalEnviado
                                        }
                                    }

                                    // if (p.feito == true) {
                                    //     lista_envio.push({ responsavel: e.nome, projeto: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                    // }
                                    if (p.ganho == true) {
                                        lista_ganho.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim), valor: p.valor })
                                        if (naoVazio(p.valor)) {
                                            totalGanho = totalGanho + p.valor
                                        }
                                    } else {
                                        lista_naoganho.push({ baixado, responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim), valor: p.valor })
                                        if (naoVazio(p.valor)) {
                                            totalNaoGanho = totalNaoGanho + p.valor
                                        }
                                    }
                                    // console.log('q=>' + q)
                                    // console.log('pr.length=>' + pr.length)
                                    if (q == pr.length) {
                                        q = 0
                                        x++
                                        // Pessoa.find({ user: id, vendedor: 'checked' }).then((pessoa_total) => {
                                        lista_ganho.forEach((g) => {
                                            // console.log('e.valor=>' + g.valor)
                                            // console.log('e.nome=>' + e.nome)
                                            if (e.nome == g.responsavel) {
                                                soma = soma + parseFloat(g.valor)
                                                // console.log("soma=>" + soma)
                                            }
                                        })
                                        // console.log("soma=>" + soma)
                                        venGanhoTotal.push({ nome: e.nome, total: mascaraDecimal(soma) })
                                        soma = 0
                                        lista_naoganho.forEach((ng) => {
                                            // console.log('e.valor=>' + ng.valor)
                                            // console.log('e.nome=>' + e.nome)
                                            if (e.nome == ng.responsavel) {
                                                soma = soma + parseFloat(ng.valor)
                                                // console.log("soma=>" + soma)
                                            }
                                        })
                                        // console.log("soma=>" + soma)
                                        venNaoGanhoTotal.push({ nome: e.nome, total: mascaraDecimal(soma) })
                                        soma = 0

                                        total = totalGanho + totalNaoGanho
                                        // console.log('x=>' + x)
                                        // console.log('pessoa.length=>' + pessoa.length)
                                        if (x == pessoa.length) {
                                            res.render('relatorios/analiseproposta', {
                                                todos_clientes, pessoa, lista_ganho, lista_naoganho,
                                                qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                                                qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length, qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length,
                                                naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, mestitulo, anotitulo, dataini: dataInput(dataini), datafim: dataInput(datafim),
                                                totalEnviado: mascaraDecimal(totalEnviado),
                                                totalNegociando: mascaraDecimal(totalNegociando),
                                                totalPerdido: mascaraDecimal(totalPerdido),
                                                totalPreco: mascaraDecimal(totalPreco),
                                                totalPrazo: mascaraDecimal(totalPrazo),
                                                totalFinan: mascaraDecimal(totalFinan),
                                                totalNegoc: mascaraDecimal(totalNegoc),
                                                totalConco: mascaraDecimal(totalConco),
                                                totalSmoti: mascaraDecimal(totalSmoti),
                                                totalAnali: mascaraDecimal(totalAnali),
                                                totalCompa: mascaraDecimal(totalCompa),
                                                totalReduc: mascaraDecimal(totalReduc),
                                                totalGanho: mascaraDecimal(totalGanho),
                                                totalNaoGanho: mascaraDecimal(totalNaoGanho),
                                                totalAberto: mascaraDecimal(totalAberto),
                                                total: mascaraDecimal(total),
                                                venGanhoTotal, venNaoGanhoTotal
                                            })
                                        }
                                        //})
                                    }
                                })
                            } else {
                                q++
                                console.log('q=>'+q)
                                console.log('pr.length=>'+ pr.length)
                                if (q == pr.length || pr.length == 0) {
                                    q = 0
                                    x++
                                    // Pessoa.find({ user: id, vendedor: 'checked' }).then((pessoa_total) => {
                                    lista_ganho.forEach((g) => {
                                        // console.log('e.valor=>' + g.valor)
                                        // console.log('e.nome=>' + e.nome)
                                        if (e.nome == g.responsavel) {
                                            soma = soma + parseFloat(g.valor)
                                            // console.log("soma=>" + soma)
                                        }
                                    })
                                    // console.log("soma=>" + soma)
                                    venGanhoTotal.push({ nome: e.nome, total: mascaraDecimal(soma) })
                                    soma = 0
                                    lista_naoganho.forEach((ng) => {
                                        // console.log('e.valor=>' + ng.valor)
                                        // console.log('e.nome=>' + e.nome)
                                        if (e.nome == ng.responsavel) {
                                            soma = soma + parseFloat(ng.valor)
                                            // console.log("soma=>" + soma)
                                        }
                                    })
                                    // console.log("soma=>" + soma)
                                    venNaoGanhoTotal.push({ nome: e.nome, total: mascaraDecimal(soma) })
                                    soma = 0

                                    total = totalGanho + totalNaoGanho
                                    // console.log('x=>' + x)
                                    // console.log('pessoa.length=>' + pessoa.length)
                                    if (x == pessoa.length) {
                                        res.render('relatorios/analiseproposta', {
                                            todos_clientes, pessoa, lista_ganho, lista_naoganho,
                                            qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                                            qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length, qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length,
                                            naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, mestitulo, anotitulo, dataini: dataInput(dataini), datafim: dataInput(datafim),
                                            totalEnviado: mascaraDecimal(totalEnviado),
                                            totalNegociando: mascaraDecimal(totalNegociando),
                                            totalPerdido: mascaraDecimal(totalPerdido),
                                            totalPreco: mascaraDecimal(totalPreco),
                                            totalPrazo: mascaraDecimal(totalPrazo),
                                            totalFinan: mascaraDecimal(totalFinan),
                                            totalNegoc: mascaraDecimal(totalNegoc),
                                            totalConco: mascaraDecimal(totalConco),
                                            totalSmoti: mascaraDecimal(totalSmoti),
                                            totalAnali: mascaraDecimal(totalAnali),
                                            totalCompa: mascaraDecimal(totalCompa),
                                            totalReduc: mascaraDecimal(totalReduc),
                                            totalGanho: mascaraDecimal(totalGanho),
                                            totalNaoGanho: mascaraDecimal(totalNaoGanho),
                                            totalAberto: mascaraDecimal(totalAberto),
                                            total: mascaraDecimal(total),
                                            venGanhoTotal, venNaoGanhoTotal
                                        })
                                    }
                                    //})
                                }
                            }
                        })
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum responsável encontrado.')
                    res.redirect('/gerenciamento/selecao')
                })
            } else {
                res.render('relatorios/analiseproposta', {
                    todos_clientes, mestitulo, anotitulo, dataini: dataInput(dataini), datafim: dataInput(datafim),
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum projeto encontrado para este filtro.')
            res.redirect('/gerenciamento/selecao')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrado.')
        res.redirect('/dashboard')
    })

})

router.get('/analisegeral/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var potencia = 0
    var valor = 0
    var totint = 0
    var qtdmod = 0
    var custoPlano = 0
    var q = 0
    Realizado.find({ user: _id }).sort({ datafim: 'asc' }).lean().then((realizado) => {
        realizado.forEach((element) => {
            Projetos.findOne({ _id: element.projeto }).then((projeto) => {

                // if (projeto.ehDireto) {
                if (projeto.qtdmod > 0) {
                    qtdmod = qtdmod + projeto.qtdmod
                } else {
                    qtdmod = qtdmod + 0
                }
                // }
                // } else {
                //     if (projeto.unimod != '' || typeof projeto.unimod != 'undefined'){
                //         qtdmod = qtdmod + projeto.unimod
                //     }
                // }
                //console.log('realizado._id=>' + element._id)
                //console.log("potencia=>" + element.potencia)
                //console.log("qtdmod=>" + qtdmod)
                if (element.potencia != '' && typeof element.potencia != 'undefined') {
                    potencia = parseFloat(potencia) + parseFloat(element.potencia)
                }
                valor = valor + element.valor
                totint = totint + element.totint
                custoPlano = custoPlano + element.custoPlano

                q = q + 1
                if (q == realizado.length) {
                    var rspmod = (parseFloat(valor) / parseFloat(qtdmod)).toFixed(2)
                    var rspkwp = (parseFloat(valor) / parseFloat(potencia)).toFixed(2)
                    var rsimod = (parseFloat(totint) / parseFloat(qtdmod)).toFixed(2)
                    var rsikwp = (parseFloat(totint) / parseFloat(potencia)).toFixed(2)
                    var custoPorModulo = (parseFloat(custoPlano) / parseFloat(qtdmod)).toFixed(2)
                    var custoPorKwp = (parseFloat(custoPlano) / parseFloat(potencia)).toFixed(2)
                    res.render('relatorios/analisegeral', { potencia, qtdmod, valor, rspkwp, rspmod, rsimod, rsikwp, custoPorModulo, custoPorKwp })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
                res.redirect('/menu')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/pedido/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    const { instalador } = req.user
    const { orcamentista } = req.user
    const { vendedor } = req.user
    const { funges } = req.user
    const { funpro } = req.user

    var id
    var ehCPF = false
    var valor

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Empresa.findOne({ user: id }).lean().then((empresa) => {
        Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
            Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                Pessoa.findOne({ _id: projeto.vendedor }).lean().then((ven) => {
                    Mensagem.find({ user: id }).lean().then((mensagem) => {
                        //console.log('empresa=>' + empresa)
                        //console.log('logo=>' + empresa.logo)
                        if (cliente.cpf != 0) {
                            ehCPF = true
                        }
                        if (naoVazio(projeto.valor)) {
                            valor = mascaraDecimal(projeto.valor)
                        } else {
                            valor = '0,00'
                        }
                        res.render('relatorios/proposta', {
                            cliente,
                            projeto,
                            mensagem,
                            instalador,
                            orcamentista,
                            vendedor,
                            funges,
                            funpro,
                            ehCPF,
                            valor: valor,
                            vendedor: ven.nome,
                            logo: empresa.logo,
                            nome: empresa.nome,
                            cnpj: empresa.cnpj,
                            endereco: empresa.endereco,
                            cidade: empresa.cidade,
                            uf: empresa.uf,
                            celular: empresa.celular,
                            telefone: empresa.telefone,
                            website: empresa.website
                        })
                    })
                })
            })
        })
    })
})

router.get('/listarealizados', ehAdmin, (req, res) => {
    const { _id } = req.user
    Realizado.find({ user: _id }).sort({ datafim: 'asc' }).lean().then((realizado) => {
        //Definindo data e hora da emissão do relatório
        var data = new Date()
        var dia = parseFloat(data.getDate())
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }
        var ano = data.getFullYear()
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = realizado.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_lbaimp = 0
        var soma_custo = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0

        for (i = 0; i < realizado.length; i++) {
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lbaimp } = realizado[i]
            const { lucroBruto } = realizado[i]
            const { lucroLiquido } = realizado[i]
            const { totalImposto } = realizado[i]
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lbaimp: soma_lbaimp, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedLL: perMedLL, perMedTrb: perMedTrb, perMedCusto: perMedCusto })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/listarabertos', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projetos.find({ user: _id, foiRealizado: false }).sort({ dataprev: 'desc' }).lean().then((projetos) => {
        //Definindo data e hora da emissão do relatório
        var data = new Date()
        var dia = data.getDate()
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }
        var ano = data.getFullYear()
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = projetos.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < projetos.length; i++) {
            const { valor } = projetos[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = projetos[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = projetos[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)            
            const { lucroBruto } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = projetos[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = projetos[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_lbaimp: soma_lbaimp, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/dashboardcustos', ehAdmin, (req, res) => {
    const { _id } = req.user

    var soma_kitfat = 0
    var soma_serfat = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Custos Fixos
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    //----------------------------------------
    //Média ponderada da participação 
    //----------------------------------------
    var soma_totfat_com = 0
    var soma_totfat_sem = 0

    var soma_totcop_com = 0
    var soma_totcop_sem = 0
    var soma_totkit_com = 0

    var soma_totkwp_com = 0
    var soma_totkwp_sem = 0
    var soma_varkwp_com = 0
    var soma_varkwp_sem = 0
    var soma_estkwp_com = 0
    var soma_estkwp_sem = 0

    //Custos Fixos
    var soma_totcus_com = 0
    var soma_totcus_sem = 0
    //Serviço
    var soma_totint_com = 0
    var soma_totint_sem = 0
    var soma_totpro_com = 0
    var soma_totpro_sem = 0
    var soma_totges_com = 0
    var soma_totges_sem = 0
    var soma_totart_com = 0
    var soma_totart_sem = 0
    //Despesas Administrativas
    var soma_totadm_com = 0
    var soma_totadm_sem = 0
    //Comissões
    var soma_totcom_com = 0
    var soma_totcom_sem = 0
    //Tributos
    var soma_tottrb_com = 0
    var soma_tottrb_sem = 0
    //Custos Variáveis
    var soma_totvar_com = 0
    var soma_totvar_sem = 0
    var soma_varfat_com = 0
    var soma_varfat_sem = 0
    var soma_totdes_com = 0
    var soma_totdes_sem = 0
    var soma_totali_com = 0
    var soma_totali_sem = 0
    var soma_totcmb_com = 0
    var soma_totcmb_sem = 0
    var soma_tothtl_com = 0
    var soma_tothtl_sem = 0
    //Custos Variáveis Estruturais
    var soma_totest_com = 0
    var soma_totest_sem = 0
    var soma_estfat_com = 0
    var soma_estfat_sem = 0
    var soma_totcer_com = 0
    var soma_totcer_sem = 0
    var soma_totcen_com = 0
    var soma_totcen_sem = 0
    var soma_totpos_com = 0
    var soma_totpos_sem = 0
    //----------------------------------------
    var ticketkwp = 0


    Realizado.find({ user: _id }).lean().then((realizado) => {
        var numprj = realizado.length

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            const { custofix } = realizado[i]
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { custovar } = realizado[i]
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { custoest } = realizado[i]
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            //-------------------------------
            //Média ponderada da participação do gastos- INÍCIO
            //-------------------------------
            if (fatequ == true) {
                soma_totkwp_com = (parseFloat(soma_totkwp_com) + parseFloat(potencia)).toFixed(2)
                soma_totcop_com = (parseFloat(soma_totcop_com) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_com = parseFloat(soma_totfat_com) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit_com = parseFloat(soma_totkit_com) + parseFloat(vlrkit)

                //Custos Fixos 
                if (custofix > 0) {
                    soma_totcus_com = (parseFloat(soma_totcus_com) + parseFloat(custofix)).toFixed(2)
                }
                //Serviços
                if (totint > 0) {
                    soma_totint_com = (parseFloat(soma_totint_com) + parseFloat(totint)).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro_com = (parseFloat(soma_totpro_com) + parseFloat(totpro)).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges_com = (parseFloat(soma_totges_com) + parseFloat(totges)).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart_com = (parseFloat(soma_totart_com) + parseFloat(vlrart)).toFixed(2)
                }
                //Tributos
                if (totalTributos > 0) {
                    soma_tottrb_com = (parseFloat(soma_tottrb_com) + parseFloat(totalTributos)).toFixed(2)
                }
                //Comissão
                if (vlrcom > 0) {
                    soma_totcom_com = (parseFloat(soma_totcom_com) + parseFloat(vlrcom)).toFixed(2)
                }
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_com = (parseFloat(soma_totadm_com) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_com = parseFloat(soma_varkwp_com) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_com = parseFloat(soma_varfat_com) + parseFloat(vlrNFS)
                    soma_totvar_com = (parseFloat(soma_totvar_com) + parseFloat(custovar)).toFixed(2)
                }

                if (totdes > 0) {
                    soma_totdes_com = (parseFloat(soma_totdes_com) + parseFloat(totdes)).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali_com = (parseFloat(soma_totali_com) + parseFloat(totali)).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb_com = (parseFloat(soma_totcmb_com) + parseFloat(totcmb)).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl_com = (parseFloat(soma_tothtl_com) + parseFloat(tothtl)).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_com = parseFloat(soma_estkwp_com) + parseFloat(potencia)
                    soma_estfat_com = parseFloat(soma_estfat_com) + parseFloat(vlrNFS)
                    soma_totest_com = (parseFloat(soma_totest_com) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_com = (parseFloat(soma_totest_com) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + 0).toFixed(2)
                }

            } else {
                //numprj_sem++

                soma_totkwp_sem = (parseFloat(soma_totkwp_sem) + parseFloat(potencia)).toFixed(2)
                soma_totcop_sem = (parseFloat(soma_totcop_sem) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_sem = parseFloat(soma_totfat_sem) + parseFloat(vlrNFS)

                //Custos Fixos 
                soma_totcus_sem = (parseFloat(soma_totcus_sem) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_sem = (parseFloat(soma_totint_sem) + parseFloat(totint)).toFixed(2)
                soma_totpro_sem = (parseFloat(soma_totpro_sem) + parseFloat(totpro)).toFixed(2)
                soma_totges_sem = (parseFloat(soma_totges_sem) + parseFloat(totges)).toFixed(2)
                soma_totart_sem = (parseFloat(soma_totart_sem) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_sem = (parseFloat(soma_tottrb_sem) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_sem = (parseFloat(soma_totcom_sem) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_sem = (parseFloat(soma_totadm_sem) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_sem = parseFloat(soma_varkwp_sem) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_sem = parseFloat(soma_varfat_sem) + parseFloat(vlrNFS)
                    soma_totvar_sem = (parseFloat(soma_totvar_sem) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_sem = (parseFloat(soma_totdes_sem) + parseFloat(totdes)).toFixed(2)
                soma_totali_sem = (parseFloat(soma_totali_sem) + parseFloat(totali)).toFixed(2)
                soma_totcmb_sem = (parseFloat(soma_totcmb_sem) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_sem = (parseFloat(soma_tothtl_sem) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_sem = parseFloat(soma_estkwp_sem) + parseFloat(potencia)
                    soma_estfat_sem = parseFloat(soma_estfat_sem) + parseFloat(vlrNFS)
                    soma_totest_sem = (parseFloat(soma_totest_sem) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_sem = (parseFloat(soma_totest_sem) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + 0).toFixed(2)
                }
            }

            //----------------------------------------
            //Média ponderada da paticipação dos gastos- FIM
            //----------------------------------------

            //console.log('valor=>' + valor)
            //console.log('potencia=>' + potencia)
            soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
            soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
            //Totalizador de Faturamento            
            if (fatequ == true) {
                soma_kitfat = parseFloat(soma_kitfat) + parseFloat(vlrNFS)
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)
            } else {
                soma_serfat = parseFloat(soma_serfat) + parseFloat(vlrNFS)
            }

            //Custos Fixos 
            //Serviços
            if (totint > 0) {
                soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
            } else {
                soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
            }
            if (totpro > 0) {
                soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
            } else {
                soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
            }
            if (totges > 0) {
                soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
            } else {
                soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
            }
            if (vlrart > 0) {
                soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
            } else {
                soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
            }
            //Tributos
            soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
            //Comissão
            soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
            //Despesas Administrativas
            if (desAdm != undefined) {
                soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
            }

            //Custos Variáveis
            if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                //console.log('soma_varkwp=>' + soma_varkwp)
                soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
            }
            if (totdes > 0) {
                soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
            } else {
                soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
            }
            if (totali > 0) {
                soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
            } else {
                soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
            }
            if (totcmb > 0) {
                soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
            } else {
                soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
            }
            if (tothtl > 0) {
                soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
            } else {
                soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
            }

            //Custos Variáveis Estruturais
            if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
            } else {
                soma_estkwp = parseFloat(soma_estkwp) + 0
                soma_estfat = parseFloat(soma_estfat) + 0
            }
            if (valorCer > 0) {
                soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
            } else {
                soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
            }
            if (valorCen > 0) {
                soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
            } else {
                soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
            }
            if (valorPos > 0) {
                soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
            } else {
                soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
            }

            if (parseFloat(valorMod) > 0) {
                soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
            }
            //console.log('soma_equkwp=>'+soma_equkwp)
            //Soma percentuais componentes
            //console.log('valorMod=>' + valorMod)
            if (valorMod != undefined) {
                soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
            }
            //console.log('soma_modequ=>' + soma_modequ)
            //console.log('valorInv=>' + valorInv)
            if (valorInv != undefined) {
                soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
            }
            //console.log('soma_invequ=>' + soma_invequ)
            //console.log('valorEst=>' + valorEst)
            if (valorEst != undefined) {
                soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
            }
            //console.log('soma_estequ=>' + soma_estequ)
            //console.log('valorCab=>' + valorCab)
            if (valorCab != undefined) {
                soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
            }
            //console.log('soma_cabequ=>' + soma_cabequ)
            //console.log('valorDis=>' + valorDis)
            if (valorDis != undefined) {
                soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
            }
            //console.log('soma_disequ=>' + soma_disequ)
            //console.log('valorDPS=>' + valorDPS)
            if (valorDPS != undefined) {
                soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
            }
            //console.log('soma_dpsequ=>' + soma_dpsequ)
            //console.log('valorSB=>' + valorSB)
            if (valorSB != undefined) {
                soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
            }
            //console.log('soma_sbxequ=>' + soma_sbxequ)
            //console.log('valorOcp=>' + valorOcp)
            if (valorOcp != undefined) {
                soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
            }
            //console.log('soma_ocpequ=>' + soma_ocpequ)

            //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
            soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
            soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
        }

        //Média Ponderada projetista
        var per_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totpro_com)) {
            per_totpro_com = 0
        }
        var per_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totpro_sem)) {
            per_totpro_sem = 0
        }
        var medkwp_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totpro_com)) {
            medkwp_totpro_com = 0
        }
        var medkwp_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totpro_sem)) {
            medkwp_totpro_sem = 0
        }
        var per_totpro = (((parseFloat(soma_totkwp_com) * parseFloat(per_totpro_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totpro_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        //Média Ponderada ART
        var per_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totart_com)) {
            per_totart_com = 0
        }
        var per_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totart_sem)) {
            per_totart_sem = 0
        }
        var medkwp_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totart_com)) {
            medkwp_totart_com = 0
        }
        var medkwp_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totart_sem)) {
            medkwp_totart_sem = 0
        }
        var per_totart = (((parseFloat(medkwp_totart_com) * parseFloat(per_totart_com)) + (parseFloat(medkwp_totart_sem) * parseFloat(per_totart_sem))) / (parseFloat(medkwp_totart_com) + parseFloat(medkwp_totart_sem))).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        //Média Ponderada Gestão
        var per_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totges_com)) {
            per_totges_com = 0
        }
        var per_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totges_sem)) {
            per_totges_sem = 0
        }
        var medkwp_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totges_com)) {
            medkwp_totges_com = 0
        }
        var medkwp_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totges_sem)) {
            medkwp_totges_sem = 0
        }
        var per_totges = (((parseFloat(soma_totkwp_com) * parseFloat(per_totges_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totges_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        //Média Ponderada instalação
        var per_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totint_com)) {
            per_totint_com = 0
        }
        var per_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totint_sem)) {
            per_totint_sem = 0
        }
        var medkwp_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totint_com)) {
            medkwp_totint_com = 0
        }
        var medkwp_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totint_sem)) {
            medkwp_totint_sem = 0
        }
        var per_totint = (((parseFloat(soma_totkwp_com) * parseFloat(per_totint_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totint_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        //Média Ponderada Administração
        var per_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totadm_com)) {
            per_totadm_com = 0
        }
        var per_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totadm_sem)) {
            per_totadm_sem = 0
        }
        var medkwp_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totadm_com)) {
            medkwp_totadm_com = 0
        }
        var medkwp_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totadm_sem)) {
            medkwp_totadm_sem = 0
        }
        var per_totadm = (((parseFloat(soma_totkwp_com) * parseFloat(per_totadm_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totadm_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        //Média Ponderada Comissão
        var per_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcom_com)) {
            per_totcom_com = 0
        }
        var per_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcom_sem)) {
            per_totcom_sem = 0
        }
        var medkwp_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcom_com)) {
            medkwp_totcom_com = 0
        }
        var medkwp_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcom_sem)) {
            medkwp_totcom_sem = 0
        }
        var per_totcom = (((parseFloat(soma_totkwp_com) * parseFloat(per_totcom_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totcom_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        //Média Ponderada Tributos
        var per_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_tottrb_com)) {
            per_tottrb_com = 0
        }
        var per_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_tottrb_sem)) {
            per_tottrb_sem = 0
        }
        var medkwp_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_tottrb_com)) {
            medkwp_tottrb_com = 0
        }
        var medkwp_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_tottrb_sem)) {
            medkwp_tottrb_sem = 0
        }
        var per_tottrb = (((parseFloat(soma_totkwp_com) * parseFloat(per_tottrb_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_tottrb_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        //Total Custos
        var custoFix_com = parseFloat(soma_totcus_com) + parseFloat(soma_totadm_com) + parseFloat(soma_totcom_com) + parseFloat(soma_tottrb_com)
        var custoFix_sem = parseFloat(soma_totcus_sem) + parseFloat(soma_totadm_sem) + parseFloat(soma_totcom_sem) + parseFloat(soma_tottrb_sem)
        var per_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcus_com)) {
            per_totcus_com = 0
        }
        var per_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcus_sem)) {
            per_totcus_sem = 0
        }
        var medkwp_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcus_com)) {
            medkwp_totcus_com = 0
        }
        var medkwp_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcus_sem)) {
            medkwp_totcus_sem = 0
        }
        var per_totcus = (((parseFloat(soma_totkwp_com) * parseFloat(per_totcus_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totcus_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totcus)) {
            per_totcus = 0
        }
        //Média Ponderada Custos Variáveis Alimentação
        var per_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totali_com)) {
            per_totali_com = 0
        }
        var per_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totali_sem)) {
            per_totali_sem = 0
        }
        var medkwp_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totali_com)) {
            medkwp_totali_com = 0
        }
        var medkwp_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totali_sem)) {
            medkwp_totali_sem = 0
        }
        var per_totali = (((parseFloat(soma_varkwp_com) * parseFloat(per_totali_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totali_sem))) / (parseFloat(soma_varkwp_sem) + parseFloat(soma_varkwp_com))).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        //Média Ponderada Custos Variáveis Deslocamento
        var per_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totdes_com)) {
            per_totdes_com = 0
        }
        var per_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totdes_sem)) {
            per_totdes_sem = 0
        }
        var medkwp_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totdes_com)) {
            medkwp_totdes_com = 0
        }
        var medkwp_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totdes_sem)) {
            medkwp_totdes_sem = 0
        }
        var per_totdes = (((parseFloat(soma_varkwp_com) * parseFloat(per_totdes_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totdes_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        //Média Ponderada Custos Variáveis Combustível
        var per_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totcmb_com)) {
            per_totcmb_com = 0
        }
        var per_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totcmb_sem)) {
            per_totcmb_sem = 0
        }
        var medkwp_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totcmb_com)) {
            medkwp_totcmb_com = 0
        }
        var medkwp_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totcmb_sem)) {
            medkwp_totcmb_sem = 0
        }
        var per_totcmb = (((parseFloat(soma_varkwp_com) * parseFloat(per_totcmb_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totcmb_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        //Média Ponderada Custos Variáveis Hotel
        var per_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_tothtl_com)) {
            per_tothtl_com = 0
        }
        var per_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_tothtl_sem)) {
            per_tothtl_sem = 0
        }
        var medkwp_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_tothtl_com)) {
            medkwp_tothtl_com = 0
        }
        var medkwp_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_tothtl_sem)) {
            medkwp_tothtl_sem = 0
        }
        var per_tothtl = (((parseFloat(soma_varkwp_com) * parseFloat(per_tothtl_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_tothtl_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        //Total Custos Variáveis
        var custoVar_com = parseFloat(soma_totvar_com)
        var custoVar_sem = parseFloat(soma_totvar_sem)
        var per_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totvar_com)) {
            per_totvar_com = 0
        }
        var per_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totvar_sem)) {
            per_totvar_sem = 0
        }
        var medkwp_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totvar_com)) {
            medkwp_totvar_com = 0
        }
        var medkwp_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totvar_sem)) {
            medkwp_totvar_sem = 0
        }
        var per_totvar = (((parseFloat(soma_varkwp_com) * parseFloat(per_totvar_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totvar_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totvar)) {
            per_totvar = 0
        }
        //Média Ponderada Variáveis Estruturais Cercamento  
        var per_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcer_com)) {
            per_totcer_com = 0
        }
        var per_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcer_sem)) {
            per_totcer_sem = 0
        }
        var medkwp_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcer_com)) {
            medkwp_totcer_com = 0
        }
        var medkwp_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcer_sem)) {
            medkwp_totcer_sem = 0
        }
        var per_totcer = (((parseFloat(soma_estkwp_com) * parseFloat(per_totcer_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(soma_estkwp_com))) / (parseFloat(soma_estkwp_sem) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        //Média Ponderada Variáveis Estruturais Central
        var per_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcen_com)) {
            per_totcen_com = 0
        }
        var per_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcen_sem)) {
            per_totcen_sem = 0
        }
        var medkwp_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcen_com)) {
            medkwp_totcen_com = 0
        }
        var medkwp_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcen_sem)) {
            medkwp_totcen_sem = 0
        }
        var per_totcen = (((parseFloat(soma_estkwp_com) * parseFloat(per_totcen_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totcen_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        //Média Ponderada Variáveis Estruturais Postes
        var per_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totpos_com)) {
            per_totpos_com = 0
        }
        var per_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totpos_sem)) {
            per_totpos_sem = 0
        }
        var medkwp_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totpos_com)) {
            medkwp_totpos_com = 0
        }
        var medkwp_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totpos_sem)) {
            medkwp_totpos_sem = 0
        }
        var per_totpos = (((parseFloat(soma_estkwp_com) * parseFloat(per_totpos_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totpos_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        //Total Custos Variáveis Estruturais
        var custoEst_com = parseFloat(soma_totest_com)
        if (isNaN(custoEst_com)) {
            custoEst_com = 0
        }
        var custoEst_sem = parseFloat(soma_totest_sem)
        if (isNaN(custoEst_sem)) {
            custoEst_sem = 0
        }
        var per_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totest_com)) {
            per_totest_com = 0
        }
        var per_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totest_sem)) {
            per_totest_sem = 0
        }
        var medkwp_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totest_com)) {
            medkwp_totest_com = 0
        }
        var medkwp_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totest_sem)) {
            medkwp_totest_sem = 0
        }
        var per_totest = (((parseFloat(soma_estkwp_com) * parseFloat(per_totest_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totest_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totest)) {
            per_totest = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)
        soma_totfat = parseFloat(soma_kitfat) + parseFloat(soma_serfat)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totdes = (parseFloat(soma_totdes) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        //Custos Variáveis Estruturais
        medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_custoEst)) {
            medkwp_custoEst = 0
        }
        medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totcer)) {
            medkwp_totcer = 0
        }
        medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totcen)) {
            medkwp_totcen = 0
        }
        medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totpos)) {
            medkwp_totpos = 0
        }
        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)

        //medkwp_serfat = parseFloat(soma_serfat) / parseFloat(soma_serkwp)
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        //ticket médio de kwp instalados
        ticketwkp = (parseFloat(soma_totkwp) / parseFloat(numprj)).toFixed(2)

        //console.log('soma_totkwp=>' + soma_totkwp)

        res.render('relatorios/dashboardcustos', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop, ticketkwp,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_custoEst,

            per_totint, per_totpro, per_totart, per_totges, per_totadm, per_tottrb, per_totcom, per_totcus, per_totvar,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_totvar,
            per_totcer, per_totcen, per_totpos, per_totest,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })

})

router.get('/dashboardcustoscomkit', ehAdmin, (req, res) => {
    const { _id } = req.user

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_tothtl = 0
    var per_totcmb = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]


            if (fatequ == true) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                if (totalTributos > 0) {
                    soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                }
                //Comissão
                if (vlrcom > 0) {
                    soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                }
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }
        }


        if (isNaN(soma_totcer)) {
            soma_totcer = 0
        }
        if (isNaN(soma_totcen)) {
            soma_totcen = 0
        }
        if (isNaN(soma_totpos)) {
            soma_totpos = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totfat)) {
            medkwp_totfat = 0
        }
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totkit)) {
            medkwp_totkit = 0
        }
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totcop)) {
            medkwp_totcop = 0
        }

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_cusfat)) {
            medkwp_cusfat = 0
        }
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totint)) {
            medkwp_totint = 0
        }
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totpro)) {
            medkwp_totpro = 0
        }
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totges)) {
            medkwp_totges = 0
        }
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totart)) {
            medkwp_totart = 0
        }
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_tottrb)) {
            medkwp_tottrb = 0
        }
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totcom)) {
            medkwp_totcom = 0
        }
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totadm)) {
            medkwp_totadm = 0
        }
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totali)) {
            medkwp_totali = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoFix)) {
            per_custoFix = 0
        }
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoVar)) {
            per_custoVar = 0
        }
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoEst)) {
            per_custoEst = 0
        }

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_kitfat)) {
            per_kitfat = 0
        }
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_comfat)) {
            per_comfat = 0
        }
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_cusfat)) {
            per_cusfat = 0
        }
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_desfat)) {
            per_desfat = 0
        }
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_trbfat)) {
            per_trbfat = 0
        }
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustoscomkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_totcmb, medkwp_tothtl,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat, medkwp_totkit,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_totcmb, per_tothtl, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })
})

router.get('/dashboardcustossemkit', ehAdmin, (req, res) => {
    const { _id } = req.user

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_tothtl = 0
    var per_totcmb = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            //Contar projetos por mês
            /*
            const { datareg } = realizado[i]

            if (datareg != undefined) {
                //Janeiro
                if (datareg >= 20210101 && datareg <= 20210131) {
                    prjjan += 1
                }
                //Fevereiro
                if (datareg >= 20210201 && datareg <= 20210228) {
                    prjfev += 1
                }
                //Março
                if (datareg >= 20210301 && datareg <= 20210331) {
                    prjmar += 1
                }
                //Abril
                if (datareg >= 20210401 && datareg <= 20210430) {
                    prjabr += 1
                }
                //Maio
                if (datareg >= 20210501 && datareg <= 20210530) {
                    prjmai = +1
                }
                //Junho
                if (datareg >= 20210601 && datareg <= 20210631) {
                    prjjun = +1
                }
                //Julho
                if (datareg >= 20210701 && datareg <= 20210730) {
                    prjjul = +1
                }
                //Agosto
                if (datareg >= 20210801 && datareg <= 20210831) {
                    prjago = +1
                }
                //Setembro
                if (datareg >= 20210901 && datareg <= 20210930) {
                    prjset = +1
                }
                //Outubro
                if (datareg >= 20211001 && datareg <= 20211031) {
                    prjout = +1
                }
                //Novembro
                if (datareg >= 20211101 && datareg <= 20211130) {
                    prjnov = +1
                }
                //Dezembro
                if (datareg >= 20211201 && datareg <= 20211231) {
                    prjdez = +1
                }
            }
            */

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]
            const { foiRealizado } = realizado[i]


            if (fatequ == false) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }


                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }
        }

        if (isNaN(soma_totcer)) {
            soma_totcer = 0
        }
        if (isNaN(soma_totcen)) {
            soma_totcen = 0
        }
        if (isNaN(soma_totpos)) {
            soma_totpos = 0
        }
        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totali)) {
            medkwp_totali = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }
        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoFix)) {
            per_custoFix = 0
        }
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustossemkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_totcmb,
            medkwp_tothtl, medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_totcop, medkwp_custoEst, medkwp_estfat, medkwp_totfat,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })
})

router.get('/dashboardbi', ehAdmin, (req, res) => {
    const { _id } = req.user
    var checkKwp
    var checkQtd
    var checkFat
    var fatrural = 0
    var fatresid = 0
    var fatcomer = 0
    var fatindus = 0
    var fatmono = 0
    var fatbifa = 0
    var fattrif = 0
    var fatnivel1 = 0
    var fatnivel2 = 0
    var fatnivel3 = 0
    var fatnivel4 = 0
    var fatnivel5 = 0
    var fatnivel6 = 0
    var fatsolo = 0
    var fattelhado = 0

    checkFat = 'checked'
    checkKwp = 'unchecked'
    checkQtd = 'unchecked'
    Projetos.find({ user: _id, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
        for (i = 0; i < rural.length; i++) {
            fatrural = fatrural + parseFloat(rural[i].vlrNFS)
        }
        Projetos.find({ user: _id, classUsina: 'Residencial' }).then((residencial) => {
            for (i = 0; i < residencial.length; i++) {
                fatresid = fatresid + parseFloat(residencial[i].vlrNFS)
            }
            Projetos.find({ user: _id, classUsina: 'Comercial' }).then((comercial) => {
                for (i = 0; i < comercial.length; i++) {
                    fatcomer = fatcomer + parseFloat(comercial[i].vlrNFS)
                }
                Projetos.find({ user: _id, classUsina: 'Industrial' }).then((industrial) => {
                    for (i = 0; i < industrial.length; i++) {
                        fatindus = fatindus + parseFloat(industrial[i].vlrNFS)
                    }
                    Projetos.find({ user: _id, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                        for (i = 0; i < solo.length; i++) {
                            fatsolo = fatsolo + parseFloat(solo[i].vlrNFS)
                        }
                        Projetos.find({ user: _id, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }, { 'tipoUsina': 'Telhado Metálico' }] }).then((telhado) => {
                            for (i = 0; i < telhado.length; i++) {
                                fattelhado = fattelhado + parseFloat(telhado[i].vlrNFS)
                            }
                            Projetos.find({ user: _id, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                for (i = 0; i < monofasico.length; i++) {
                                    fatmono = fatmono + parseFloat(monofasico[i].vlrNFS)
                                }
                                Projetos.find({ user: _id, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                    for (i = 0; i < bifasico.length; i++) {
                                        fatbifa = fatbifa + parseFloat(bifasico[i].vlrNFS)
                                    }
                                    Projetos.find({ user: _id, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                        for (i = 0; i < trifasico.length; i++) {
                                            fattrif = fattrif + parseFloat(trifasico[i].vlrNFS)
                                        }
                                        Projetos.find({ user: _id, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                            for (i = 0; i < nivel1.length; i++) {
                                                fatnivel1 = fatnivel1 + parseFloat(nivel1[i].vlrNFS)
                                            }
                                            Projetos.find({ user: _id, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                for (i = 0; i < nivel2.length; i++) {
                                                    fatnivel2 = fatnivel2 + parseFloat(nivel2[i].vlrNFS)
                                                }
                                                Projetos.find({ user: _id, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                    for (i = 0; i < nivel3.length; i++) {
                                                        fatnivel3 = fatnivel3 + parseFloat(nivel3[i].vlrNFS)
                                                    }
                                                    Projetos.find({ user: _id, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                        for (i = 0; i < nivel4.length; i++) {
                                                            fatnivel4 = fatnivel4 + parseFloat(nivel4[i].vlrNFS)
                                                        }
                                                        Projetos.find({ user: _id, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                            for (i = 0; i < nivel5.length; i++) {
                                                                fatnivel5 = fatnivel5 + parseFloat(nivel5[i].vlrNFS)
                                                            }
                                                            Projetos.find({ user: _id, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                for (i = 0; i < nivel6.length; i++) {
                                                                    fatnivel6 = fatnivel6 + parseFloat(nivel6[i].vlrNFS)
                                                                }
                                                                Realizado.find({ user: _id }).lean().then((realizados) => {
                                                                    Projetos.find({ user: _id, homologado: true }).lean().then((homologado) => {
                                                                        Projetos.find({ user: _id, atrasado: true }).lean().then((atrasado) => {
                                                                            Projetos.find({ user: _id, executando: true }).lean().then((executando) => {
                                                                                Projetos.find({ user: _id, orcado: true }).lean().then((orcado) => {
                                                                                    Projetos.find({ user: _id, parado: true }).lean().then((parado) => {
                                                                                        Projetos.find({ user: _id, foiRealizado: true }).lean().then((foirealizado) => {
                                                                                            res.render('relatorios/dashboardbi', { realizados, homologado, atrasado, executando, orcado, foirealizado, parado, checkFat, checkKwp, checkQtd, fatrural, fatresid, fatcomer, fatindus, fatsolo, fattelhado, fatmono, fatbifa, fattrif, fatnivel1, fatnivel2, fatnivel3, fatnivel4, fatnivel5, fatnivel6 })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                res.redirect('/relatorios/dashboardbi')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
            res.redirect('/relatorios/dashboardbi')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
        res.redirect('/relatorios/dashboardbi')
    })
})

router.get('/priorizacao', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var lista_projetos = []
    var lista_compras = []
    var q = 0
    var qc = 0
    var dtprevisao
    var dtrecebimento
    Projeto.find({ user: id, ganho: true, encerrado: false, baixada: false }).sort({ data: 'asc' }).then((projetos) => {
        projetos.forEach((p) => {
            Cliente.findOne({ _id: p.cliente }).then((cli) => {
                q++
                lista_projetos.push({ id: p._id, seq: p.seq, cliente: cli.nome, data: dataMsgNum(p.data), nota: false, match: false })
                //console.log('q=>'+q)
                //console.log('propostas=>'+propostas.length)
                if (q == projetos.length) {
                    var nota
                    var recebido
                    lista_projetos.comparaNum()
                    if (naoVazio(compras)) {
                        compras.forEach((c) => {
                            Projeto.findOne({ _id: c.projeto }).then((projeto) => {
                                Cliente.findOne({ _id: projeto.cliente }).then((cli1) => {
                                    //console.log('c._id=>'+c._id)
                                    qc++
                                    //console.log('projeto.seq=>'+projeto.seq)
                                    //console.log('c.dtprevisao=>'+c.dtprevisao)
                                    if (naoVazio(c.dtprevisao)) {
                                        dtprevisao = c.dtprevisao
                                    } else {
                                        dtprevisao = '00000000'
                                    }

                                    if (naoVazio(c.dtrecebimento)) {
                                        dtrecebimento = c.dtrecebimento
                                        recebido = true
                                    } else {
                                        dtrecebimento = '0000-00-00'
                                        recebido = false
                                    }

                                    if (c.feitonota) {
                                        nota = true
                                    } else {
                                        nota = false
                                    }

                                    //console.log('dtprevisao=>'+dtprevisao)
                                    lista_compras.push({ id: projeto._id, seq: projeto.seq, cliente: cli1.nome, previsao: dataMsgNum(dtprevisao), recebimento: dataMensagem(dtrecebimento), recebido, nota, match: false })
                                    //console.log('qc=>'+qc)
                                    //console.log('compras.length=>'+compras.length)
                                    if (qc == compras.length) {
                                        //console.log('lista_projetos=>'+lista_projetos)
                                        var i
                                        lista_projetos.forEach((e) => {
                                            //console.log('e=>' + e.seq)
                                            //console.log('i=>' + i)
                                            i = 0
                                            while (i < lista_compras.length) {
                                                //console.log('e.seq=>' + e.seq)
                                                //console.log('lista_compras[i].seq=>' + lista_compras[i].seq)
                                                if (e.seq == lista_compras[i].seq) {
                                                    //console.log('encontrou')
                                                    e.match = true
                                                    lista_compras[i].match = true
                                                    //console.log('nota=>' + lista_compras[i].nota)
                                                    if (lista_compras[i].nota) {
                                                        e.nota = true
                                                    }
                                                    break
                                                }
                                                i++
                                            }
                                            //console.log('saiu do laço')
                                        })
                                        res.render('relatorios/priorizacao', { lista_projetos, lista_compras })
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma propostsa encontrada.')
                                res.redirect('/menu')
                            })
                        })
                    } else {
                        res.render('relatorios/priorizacao', { lista_projetos, lista_compras })
                    }
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/menu')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum projeto encontrado par este filtro.')
        res.redirect('/menu')
    })
})

router.post('/analisar', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var dataini
    var datafim
    var dtinicio
    var dtfim
    var sql = {}
    var busca = []
    var buscapessoa = []

    var mestituloinicio
    var mestitulofim
    var anotituloinicio
    var anotitulofim

    var lista_ganho = []
    var lista_naoganho = []
    var lista_preco = []
    var lista_prazo = []
    var lista_finan = []
    var lista_conco = []
    var lista_smoti = []
    var lista_negoc = []
    var lista_anali = []
    var lista_compa = []
    var lista_reduc = []
    var lista_envia = []

    var totalGanho = 0
    var totalNaoGanho = 0
    var totalEnviado = 0
    var totalNegociando = 0
    var totalAberto = 0
    var totalPerdido = 0
    var totalPreco = 0
    var totalPrazo = 0
    var totalFinan = 0
    var totalNegoc = 0
    var totalConco = 0
    var totalSmoti = 0
    var totalAnali = 0
    var totalCompa = 0
    var totalReduc = 0

    var resp
    var baixado

    var q = 0

    var nomeCliente
    var nomeVendedor

    //console.log('req.body.dataini=>' + req.body.dataini)
    //console.log('req.body.datafim=>' + req.body.datafim)
    var cliente = req.body.cliente
    var vendedor = req.body.vendedor

    if (req.body.dataini == '' || req.body.datafim == '' || (dataBusca(req.body.dataini) > dataBusca(req.body.datafim))) {
        req.flash('error_msg', 'Verificar as datas de busca escolhidas.')
        if (req.body.tipo != '') {
            res.redirect('/dashboard/' + req.body.tipo)
        } else {
            res.redirect('/dashboard/')
        }
    }
    if (cliente == 'Todos') {
        clibusca = '111111111111111111111111'
    } else {
        clibusca = cliente
    }
    if (vendedor == 'Todos') {
        venbusca = '111111111111111111111111'
    } else {
        venbusca = vendedor
    }

    Pessoa.find({ user: id, vendedor: 'checked' }).lean().then((todas_pessoas) => {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
            Pessoa.findOne({ _id: venbusca }).then((nome_ven) => {
                Cliente.findOne({ _id: clibusca }).then((nome_cli) => {
                    // //console.log('nome_cli=>' + nome_cli)
                    // //console.log('nome_ven=>' + nome_ven)
                    if (nome_cli == null) {
                        nomeCliente = 'Todos'
                    } else {
                        nomeCliente = nome_cli.nome
                    }
                    if (nome_ven == null) {
                        nomeVendedor = 'Todos'
                    } else {
                        nomeVendedor = nome_res.nome
                    }

                    dataini = req.body.dataini
                    datafim = req.body.datafim
                    mestituloinicio = pegames(dataini.substring(5, 7))
                    mestitulofim = pegames(datafim.substring(5, 7))
                    anotituloinicio = dataini.substring(0, 4)
                    anotitulofim = datafim.substring(0, 4)
                    dataini = dataBusca(req.body.dataini)
                    datafim = dataBusca(req.body.datafim)

                    // //console.log('dataini=>' + dataini)
                    // //console.log('datafim=>' + datafim)
                    // //console.log('req.body.vendedor=>' + req.body.vendedor)
                    if (vendedor == 'Todos') {
                        buscapessoa = { user: id, vendedor: 'checked' }
                    } else {
                        buscapessoa = { user: id, _id: vendedor }
                    }
                    //console.log('buscapessoa=>' + buscapessoa)
                    Projeto.find({ user: id, datacad: { $lte: datafim, $gte: dataini } }).then((projeto) => {
                        if (naoVazio(projeto)) {
                            //console.log('projeto=>'+projeto)
                            Pessoa.find(buscapessoa).then((pessoa) => {
                                //console.log('pessoa=>' + pessoa)
                                pessoa.forEach((e) => {
                                    //console.log('e=>' + e)
                                    if (vendedor != 'Todos') {
                                        ven = e._id
                                    } else {
                                        ven = vendedor
                                    }
                                    //console.log('vendedor=>' + vendedor)
                                    //console.log('cliente=>' + cliente)
                                    if (vendedor == 'Todos' && cliente == 'Todos') {
                                        sql = { user: id, 'datacad': { $lte: datafim, $gte: dataini } }
                                    } else {
                                        if (vendedor != 'Todos' && cliente == 'Todos') {
                                            sql = { user: id, vendedor: vendedor, 'datacad': { $lte: datafim, $gte: dataini } }
                                        } else {
                                            if (vendedor == 'Todos' && cliente == 'Todos') {
                                                sql = { user: id, cliente: cliente, 'datacad': { $lte: datafim, $gte: dataini } }
                                            } else {
                                                if (vendedor != 'Todos' && cliente != 'Todos') {
                                                    sql = { user: id, cliente: cliente, vendedor: vendedor, 'datacad': { $lte: datafim, $gte: dataini } }
                                                }
                                            }
                                        }
                                    }
                                    //console.log('sql=>' + JSON.stringify(sql))
                                    Projeto.find(sql).sort({ datacad: 'asc' }).then((pr) => {
                                        if (naoVazio(pr)) {
                                            pr.forEach((p) => {
                                                //console.log('e._id=>' + e._id)
                                                q++
                                                if (p.baixada == true) {
                                                    baixado = 'Sim'
                                                } else {
                                                    baixado = 'Não'
                                                }

                                                if (naoVazio(p.dtinicio)) {
                                                    dtinicio = p.dtinicio
                                                } else {
                                                    dtinicio = '0000-00-00'
                                                }

                                                if (naoVazio(p.dtfim)) {
                                                    dtfim = p.dtfim
                                                } else {
                                                    dtfim = '0000-00-00'
                                                }

                                                if (naoVazio(p.motivo) && p.baixada == true) {
                                                    if (naoVazio(p.valor)) {
                                                        totalPerdido = totalPerdido + p.valor
                                                    }
                                                    if (p.motivo == 'Fechou com concorrente') {
                                                        lista_conco.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                        if (naoVazio(p.valor)) {
                                                            totalConco = totalConco + p.valor
                                                        }
                                                    }
                                                    if (p.motivo == 'Não conseguiu o financiamento') {
                                                        lista_finan.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                        if (naoVazio(p.valor)) {
                                                            totalFinan = totalFinan + p.valor
                                                        }
                                                    }
                                                    if (p.motivo == 'Preço elevado') {
                                                        lista_preco.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                        if (naoVazio(p.valor)) {
                                                            totalPreco = totalPreco + p.valor
                                                        }
                                                    }
                                                    if (p.motivo == 'Prazo de instalação') {
                                                        lista_prazo.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                        if (naoVazio(p.valor)) {
                                                            totalPrazo = totalPrazo + p.valor
                                                        }
                                                    }
                                                    if (p.motivo == 'Sem motivo') {
                                                        lista_smoti.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                        if (naoVazio(p.valor)) {
                                                            totalSmoti = totalSmoti + p.valor
                                                        }
                                                    }
                                                } else {
                                                    if (naoVazio(p.status) && p.ganho == false) {
                                                        if (naoVazio(p.valor)) {
                                                            totalAberto = totalAberto + p.valor
                                                        }
                                                        if (p.status == 'Enviado') {
                                                            lista_envia.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                            if (naoVazio(p.valor)) {
                                                                totalEnviado = totalEnviado + p.valor
                                                            }
                                                        }
                                                        if (p.status == 'Negociando') {
                                                            lista_negoc.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                            if (naoVazio(p.valor)) {
                                                                totalNegoc = totalNegoc + p.valor
                                                                totalNegociando = totalNegociando + p.valor
                                                            }
                                                        }
                                                        if (p.status == 'Analisando Financiamento') {
                                                            lista_anali.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                            if (naoVazio(p.valor)) {
                                                                totalAnali = totalAnali + p.valor
                                                                totalNegociando = totalNegociando + p.valor
                                                            }
                                                        }
                                                        if (p.status == 'Comparando Propostas') {
                                                            lista_compa.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                            if (naoVazio(p.valor)) {
                                                                totalCompa = totalCompa + p.valor
                                                                totalNegociando = totalNegociando + p.valor
                                                            }
                                                        }
                                                        if (p.status == 'Aguardando redução de preço') {
                                                            lista_reduc.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                            if (naoVazio(p.valor)) {
                                                                totalReduc = totalReduc + p.valor
                                                                totalNegociando = totalNegociando + p.valor
                                                            }
                                                        }
                                                    }
                                                }

                                                // if (p.feito == true) {
                                                //     lista_envio.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                // }
                                                if (p.ganho == true) {
                                                    lista_ganho.push({ responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                    if (naoVazio(p.valor)) {
                                                        totalGanho = totalGanho + p.valor
                                                    }
                                                } else {
                                                    lista_naoganho.push({ baixado, responsavel: e.nome, projeto: p.seq, datacad: dataMsgNum(p.datacad), dataini: dataMensagem(dtinicio), datafim: dataMensagem(dtfim) })
                                                    if (naoVazio(p.valor)) {
                                                        totalNaoGanho = totalNaoGanho + p.valor
                                                    }
                                                }

                                                //console.log('q=>' + q)
                                                //console.log('projeto.length=>' + projeto.length)
                                                if (q == projeto.length) {

                                                    lista_ganho.sort(comparaNum)
                                                    lista_naoganho.sort(comparaNum)

                                                    var total = totalGanho + totalNaoGanho

                                                    res.render('relatorios/analiseproposta', {
                                                        todos_clientes, pessoa: todas_pessoas, lista_ganho, lista_naoganho,
                                                        qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                                                        qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length,
                                                        qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length, naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length,
                                                        mestituloinicio, anotituloinicio, mestitulofim, anotitulofim, dataini: dataInput(dataini), datafim: dataInput(datafim),
                                                        totalEnviado: mascaraDecimal(totalEnviado),
                                                        totalNegociando: mascaraDecimal(totalNegociando),
                                                        totalPreco: mascaraDecimal(totalPreco),
                                                        totalPrazo: mascaraDecimal(totalPrazo),
                                                        totalFinan: mascaraDecimal(totalFinan),
                                                        totalNegoc: mascaraDecimal(totalNegoc),
                                                        totalConco: mascaraDecimal(totalConco),
                                                        totalSmoti: mascaraDecimal(totalSmoti),
                                                        totalAnali: mascaraDecimal(totalAnali),
                                                        totalCompa: mascaraDecimal(totalCompa),
                                                        totalReduc: mascaraDecimal(totalReduc),
                                                        totalGanho: mascaraDecimal(totalGanho),
                                                        totalNaoGanho: mascaraDecimal(totalNaoGanho),
                                                        totalAberto: mascaraDecimal(totalAberto),
                                                        total: mascaraDecimal(total)
                                                    })
                                                }
                                            })
                                        } else {
                                            res.render('relatorios/analiseproposta', { todos_clientes, pessoa: todas_pessoas, lista_ganho, lista_naoganho, lista_envio, qtd_envio, qtd_ganho, naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, envio_total: lista_envio.length, mestituloinicio, anotituloinicio, mestitulofim, anotitulofim, dataini: dataInput(dataini), datafim: dataInput(datafim) })
                                        }
                                    })
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma pessoa encontrada.')
                                res.redirect('/relatorios/analiseproposta')
                            })
                        } else {
                            res.render('relatorios/analiseproposta', { todos_clientes, pessoa: todas_pessoas, lista_ganho, lista_naoganho, lista_envio, qtd_envio, qtd_ganho, naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, envio_total: lista_envio.length, mestituloinicio, anotituloinicio, mestitulofim, anotitulofim, dataini: dataInput(dataini), datafim: dataInput(datafim) })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum projeto encontrado par este filtro.')
                        res.redirect('/relatorios/analiseproposta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/relatorios/analiseproposta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma responsável encontrado.')
                res.redirect('/relatorios/analiseproposta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum cliente encontrado.')
            res.redirect('/relatorios/analiseproposta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhuma responsável encontrado.')
        res.redirect('/relatorios/analiseproposta')
    })
})

router.post('/aplicar', ehAdmin, (req, res) => {
    const { _id } = req.user

    var checkKwp
    var checkQtd
    var checkFat
    var fatrural = 0
    var fatresid = 0
    var fatcomer = 0
    var fatindus = 0
    var fatmono = 0
    var fatbifa = 0
    var fattrif = 0
    var fatnivel1 = 0
    var fatnivel2 = 0
    var fatnivel3 = 0
    var fatnivel4 = 0
    var fatnivel5 = 0
    var fatnivel6 = 0
    var qtdrural = 0
    var qtdresid = 0
    var qtdcomer = 0
    var qtdindus = 0
    var qtdmono = 0
    var qtdbifa = 0
    var qtdtrif = 0
    var qtdnivel1 = 0
    var qtdnivel2 = 0
    var qtdnivel3 = 0
    var qtdnivel4 = 0
    var qtdnivel5 = 0
    var qtdnivel6 = 0
    var kwprural = 0
    var kwpresid = 0
    var kwpcomer = 0
    var kwpindus = 0
    var kwpmono = 0
    var kwpbifa = 0
    var kwptrif = 0
    var kwpnivel1 = 0
    var kwpnivel2 = 0
    var kwpnivel3 = 0
    var kwpnivel4 = 0
    var kwpnivel5 = 0
    var kwpnivel6 = 0
    var fatsolo = 0
    var fattelhado = 0
    var qtdsolo = 0
    var qtdtelhado = 0
    var kwpsolo = 0
    var kwptelhado = 0

    var dataini
    var datafim
    var mestitulo = ''
    var ano = req.body.mesano
    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    var selecionado = req.body.selecionado
    //console.log('selecionado=>' + selecionado)

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    if (selecionado == 'faturamento') {
        checkFat = 'checked'
        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
            for (i = 0; i < rural.length; i++) {
                fatrural = fatrural + parseFloat(rural[i].vlrNFS)
            }
            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                for (i = 0; i < residencial.length; i++) {
                    fatresid = fatresid + parseFloat(residencial[i].vlrNFS)
                }
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                    for (i = 0; i < comercial.length; i++) {
                        fatcomer = fatcomer + parseFloat(comercial[i].vlrNFS)
                    }
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                        for (i = 0; i < industrial.length; i++) {
                            fatindus = fatindus + parseFloat(industrial[i].vlrNFS)
                        }
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                            for (i = 0; i < solo.length; i++) {
                                fatsolo = fatsolo + parseFloat(solo[i].vlrNFS)
                            }
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                for (i = 0; i < telhado.length; i++) {
                                    fattelhado = fattelhado + parseFloat(telhado[i].vlrNFS)
                                }
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                    for (i = 0; i < monofasico.length; i++) {
                                        fatmono = fatmono + parseFloat(monofasico[i].vlrNFS)
                                    }
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                        for (i = 0; i < bifasico.length; i++) {
                                            fatbifa = fatbifa + parseFloat(bifasico[i].vlrNFS)
                                        }
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                            for (i = 0; i < trifasico.length; i++) {
                                                fattrif = fattrif + parseFloat(trifasico[i].vlrNFS)
                                            }
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                for (i = 0; i < nivel1.length; i++) {
                                                    fatnivel1 = fatnivel1 + parseFloat(nivel1[i].vlrNFS)
                                                }
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                    for (i = 0; i < nivel2.length; i++) {
                                                        fatnivel2 = fatnivel2 + parseFloat(nivel2[i].vlrNFS)
                                                    }
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                        for (i = 0; i < nivel3.length; i++) {
                                                            fatnivel3 = fatnivel3 + parseFloat(nivel3[i].vlrNFS)
                                                        }
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                            for (i = 0; i < nivel4.length; i++) {
                                                                fatnivel4 = fatnivel4 + parseFloat(nivel4[i].vlrNFS)
                                                            }
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                for (i = 0; i < nivel5.length; i++) {
                                                                    fatnivel5 = fatnivel5 + parseFloat(nivel5[i].vlrNFS)
                                                                }
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                    for (i = 0; i < nivel6.length; i++) {
                                                                        fatnivel6 = fatnivel6 + parseFloat(nivel6[i].vlrNFS)
                                                                    }
                                                                    Realizado.find({ user: _id }).lean().then((realizados) => {
                                                                        Projetos.find({ user: _id, homologado: true }).lean().then((homologado) => {
                                                                            Projetos.find({ user: _id, atrasado: true }).lean().then((atrasado) => {
                                                                                Projetos.find({ user: _id, executando: true }).lean().then((executando) => {
                                                                                    Projetos.find({ user: _id, orcado: true }).lean().then((orcado) => {
                                                                                        Projetos.find({ user: _id, parado: true }).lean().then((parado) => {
                                                                                            Projetos.find({ user: _id, foiRealizado: true }).lean().then((foirealizado) => {
                                                                                                res.render('relatorios/dashboardbi', { realizados, homologado, atrasado, executando, orcado, foirealizado, parado, checkFat, checkKwp, checkQtd, fatrural, fatresid, fatcomer, fatindus, fatsolo, fattelhado, fatmono, fatbifa, fattrif, fatnivel1, fatnivel2, fatnivel3, fatnivel4, fatnivel5, fatnivel6, mestitulo, ano, selecionado })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                res.redirect('/relatorios/dashboardbi')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
            res.redirect('/relatorios/dashboardbi')
        })

    } else {
        if (selecionado == 'quantidade') {
            checkQtd = 'checked'
            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
                qtdrural = rural.length
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                    qtdresid = residencial.length
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                        qtdcomer = comercial.length
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                            qtdindus = industrial.length
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                                qtdsolo = solo.length
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                    qtdtelhado = telhado.length
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                        qtdmono = monofasico.length
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                            qtdbifa = bifasico.length
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                                qtdtrif = trifasico.length
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                    qtdnivel1 = nivel1.length
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                        qtdnivel2 = nivel2.length
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                            qtdnivel3 = nivel3.length
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                                qtdnivel4 = nivel4.length
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                    qtdnivel5 = nivel5.length
                                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                        qtdnivel6 = nivel6.length
                                                                        res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, qtdrural, qtdresid, qtdcomer, qtdindus, qtdsolo, qtdtelhado, qtdmono, qtdbifa, qtdtrif, qtdnivel1, qtdnivel2, qtdnivel3, qtdnivel4, qtdnivel5, qtdnivel6, mestitulo, ano, selecionado })
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                        res.redirect('/relatorios/dashboardbi')
                                                                    })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                                res.redirect('/relatorios/dashboardbi')
                            })

                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
                res.redirect('/relatorios/dashboardbi')
            })
        } else {
            if (selecionado == 'potencia') {
                checkKwp = 'checked'
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
                    for (i = 0; i < rural.length; i++) {
                        kwprural = kwprural + parseFloat(rural[i].potencia)
                    }
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                        for (i = 0; i < residencial.length; i++) {
                            kwpresid = kwpresid + parseFloat(residencial[i].potencia)
                        }
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                            for (i = 0; i < comercial.length; i++) {
                                kwpcomer = kwpcomer + parseFloat(comercial[i].potencia)
                            }
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                                for (i = 0; i < industrial.length; i++) {
                                    kwpindus = kwpindus + parseFloat(industrial[i].potencia)
                                }
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                                    for (i = 0; i < solo.length; i++) {
                                        kwpsolo = kwpsolo + parseFloat(solo[i].potencia)
                                    }
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                        for (i = 0; i < telhado.length; i++) {
                                            kwptelhado = kwptelhado + parseFloat(telhado[i].potencia)
                                        }
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                            for (i = 0; i < monofasico.length; i++) {
                                                kwpmono = kwpmono + parseFloat(monofasico[i].potencia)
                                            }
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                                for (i = 0; i < bifasico.length; i++) {
                                                    kwpbifa = kwpbifa + parseFloat(bifasico[i].potencia)
                                                }
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                                    for (i = 0; i < trifasico.length; i++) {
                                                        kwptrif = kwptrif + parseFloat(trifasico[i].potencia)
                                                    }
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                        for (i = 0; i < nivel1.length; i++) {
                                                            kwpnivel1 = kwpnivel1 + parseFloat(nivel1[i].potencia)
                                                        }
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                            for (i = 0; i < nivel2.length; i++) {
                                                                kwpnivel2 = kwpnivel2 + parseFloat(nivel2[i].potencia)
                                                            }
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                                for (i = 0; i < nivel3.length; i++) {
                                                                    kwpnivel3 = kwpnivel3 + parseFloat(nivel3[i].potencia)
                                                                }
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                                    for (i = 0; i < nivel4.length; i++) {
                                                                        kwpnivel4 = kwpnivel4 + parseFloat(nivel4[i].potencia)
                                                                    }
                                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                        for (i = 0; i < nivel5.length; i++) {
                                                                            kwpnivel5 = kwpnivel5 + parseFloat(nivel5[i].potencia)
                                                                        }
                                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                            for (i = 0; i < nivel6.length; i++) {
                                                                                kwpnivel6 = kwpnivel6 + parseFloat(nivel6[i].potencia)
                                                                            }
                                                                            res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, kwprural, kwpresid, kwpcomer, kwpindus, kwpsolo, kwptelhado, kwpmono, kwpbifa, kwptrif, kwpnivel1, kwpnivel2, kwpnivel3, kwpnivel4, kwpnivel5, kwpnivel6, mestitulo, ano, selecionado })
                                                                        }).catch((err) => {
                                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                            res.redirect('/relatorios/dashboardbi')
                                                                        })
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                        res.redirect('/relatorios/dashboardbi')
                                                                    })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                                    res.redirect('/relatorios/dashboardbi')
                                })

                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            } else {
                var aviso = []
                aviso.push({ texto: 'Nenhum registro encontrado.' })
                if (selecionado == 'faturamento') {
                    checkFat = 'checked'
                    checkQtd = 'unchecked'
                    checkKwp = 'unchecked'
                } else {
                    if (selecionado == 'quantidade') {
                        checkQtd = 'checked'
                        checkFat = 'unchecked'
                        checkKwp = 'unchecked'
                    } else {
                        checkKwp = 'checked'
                        checkQtd = 'unchecked'
                        checkFat = 'unchecked'
                    }
                }
                res.render('relatorios/dashboardbi/', { aviso, mestitulo, ano, checkFat, checkQtd, checkKwp })
            }
        }
    }
})

router.post('/imprimir', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var lista = []
    var busca = []
    var sql = []
    var data = []
    var encerrado = []
    var q = 0

    var responsavel
    var nome_insres
    var dif
    var data1
    var data2
    var dif

    var cliente = req.body.idcli
    var empresa = req.body.idemp
    var vendedor = req.body.idres
    var dataini = dataBusca(req.body.dataini)
    var datafim = dataBusca(req.body.datafim)
    //console.log(cliente)
    //console.log(empresa)
    //console.log(respons)
    //console.log(dataini)
    //console.log(datafim)

    data = { 'datacad': { $lte: datafim, $gte: dataini } }
    sql = filtrarProjeto(2, id, 'Todos', 'Todos', respons, empresa, cliente, false, false, false, false)
    encerrado = { encerrado: true }
    busca = Object.assign(data, sql, encerrado)
    Projeto.find(busca).then((projeto) => {
        projeto.forEach((e) => {
            //console.log('e=>' + e.id)
            Cliente.findOne({ _id: e.cliente }).lean().then((lista_cliente) => {
                Equipe.findOne({ _id: e.equipe, $and: [{ 'custoins': { $ne: 0 } }, { 'custoins': { $ne: null } }] }).then((equipe) => {
                    Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                        Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                            q++
                            if (naoVazio(lista_responsavel)) {
                                responsavel = lista_responsavel.nome
                            } else {
                                responsavel = ''
                            }

                            if (naoVazio(insres)) {
                                nome_insres = insres.nome
                            } else {
                                nome_insres = ''
                            }
                            data1 = new Date(equipe.dtfim)
                            data2 = new Date(equipe.dtinicio)
                            dif = Math.abs(data1.getTime() - data2.getTime())
                            //console.log('dif=>'+dif)
                            days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                            //console.log('dif=>'+dif)
                            custototal = parseFloat(equipe.custoins) * parseFloat(days)
                            lista.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim), custo: custototal, ins0: equipe.ins0, ins1: equipe.ins1, ins2: equipe.ins2, ins3: equipe.ins3, ins4: equipe.ins4, ins5: equipe.ins5 })
                            if (q == projeto.length) {
                                Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).lean().then((instalador) => {
                                    res.render('relatorios/imprimirConsulta', { lista, instalador, respons, cliente, empresa, datafim, dataini })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                    res.redirect('/dashboard/encerrado')
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                            res.redirect('/dashboard/encerrado')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum gestor responsável encontrado')
                        res.redirect('/dashboard/encerrado')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                    res.redirect('/dashboard/encerrado')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                res.redirect('/dashboard/encerrado')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a projeto.')
        res.redirect('/dashboard/encerrado')
    })
})

router.post('/filtraRelatorio', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var lista = []
    var busca = []
    var sql = []
    var data = []
    var encerrado = []
    var q = 0

    var responsavel
    var nome_insres
    var dif

    var cliente = req.body.cliente
    var empresa = req.body.empresa
    var respons = req.body.responsavel
    var dataini = req.body.dataini
    var datafim = req.body.datafim
    //console.log(cliente)
    //console.log(empresa)
    //console.log(respons)
    //console.log(dataini)
    //console.log(datafim)

    data = { 'datacad': { $lte: datafim, $gte: dataini } }
    sql = filtrarProjeto(2, id, 'Todos', 'Todos', respons, empresa, cliente, false, false, false, false)
    encerrado = { encerrado: true }
    busca = Object.assign(data, sql, encerrado)
    //console.log("req.body.ins=>" + req.body.ins)
    Pessoa.findOne({ _id: req.body.ins }).then((ins) => {
        Projeto.find(busca).then((projeto) => {
            projeto.forEach((e) => {
                //console.log('e=>' + e.id)
                Cliente.findOne({ _id: e.cliente }).lean().then((lista_cliente) => {
                    Equipe.findOne({ _id: e.equipe, $or: [{ 'idins0': ins }, { 'idins1': ins }, { 'idins2': ins }, { 'idins3': ins }, { 'idins4': ins }, { 'idins5': ins }], $and: [{ 'custoins': { $ne: 0 } }, { 'custoins': { $ne: null } }] }).then((equipe) => {
                        //console.log('equipe=>' + equipe)
                        Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                            Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                q++
                                if (naoVazio(lista_responsavel)) {
                                    responsavel = lista_responsavel.nome
                                } else {
                                    responsavel = ''
                                }

                                if (naoVazio(insres)) {
                                    nome_insres = insres.nome
                                } else {
                                    nome_insres = ''
                                }
                                dif = parseFloat(dataBusca(equipe.dtfim)) - parseFloat(dataBusca(equipe.dtinicio)) + 1
                                //console.log('dif=>'+dif)
                                custototal = parseFloat(ins.custo) * parseFloat(dif)
                                lista.push({ id: e._id, cliente: lista_cliente.nome, responsavel, nome_insres, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim), custo: custototal, ins0: ins.nome })
                                if (q == projeto.length) {
                                    Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).lean().then((instalador) => {
                                        res.render('relatorios/imprimirConsulta', { lista, instalador, respons, cliente, empresa, datafim, dataini })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/dashboard/encerrado')
                                    })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                res.redirect('/dashboard/encerrado')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum gestor responsável encontrado')
                            res.redirect('/dashboard/encerrado')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                        res.redirect('/dashboard/encerrado')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                    res.redirect('/dashboard/encerrado')
                })
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a projeto.')
            res.redirect('/dashboard/encerrado')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
        res.redirect('/dashboard/encerrado')
    })
})

router.post('/analiseGeral', ehAdmin, (req, res) => {
    const { _id } = req.user
    var potencia = 0
    var valor = 0
    var totint = 0
    var qtdmod = 0
    var custoPlano = 0
    var q = 0

    var dataini
    var datafim
    var mestitulo = ''
    var ano = req.body.mesano
    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    Realizado.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini } }).sort({ datafim: 'asc' }).lean().then((realizado) => {
        realizado.forEach((element) => {
            Projetos.findOne({ _id: element.projeto }).then((projeto) => {
                if (projeto.ehDireto) {
                    if (projeto.qtdmod > 0) {
                        qtdmod = qtdmod + projeto.qtdmod
                    } else {
                        qtdmod = qtdmod + 0
                    }
                } else {
                    qtdmod = qtdmod + projeto.unimod
                }
                potencia = parseFloat(potencia) + parseFloat(element.potencia)

                valor = valor + element.valor
                totint = totint + element.totint
                custoPlano = custoPlano + element.custoPlano

                //console.log('q=>'+q)
                q = q + 1
                if (q == realizado.length) {
                    var rspmod = (parseFloat(valor) / parseFloat(qtdmod)).toFixed(2)
                    var rspkwp = (parseFloat(valor) / parseFloat(potencia)).toFixed(2)
                    var rsimod = (parseFloat(totint) / parseFloat(qtdmod)).toFixed(2)
                    var rsikwp = (parseFloat(totint) / parseFloat(potencia)).toFixed(2)
                    var custoPorModulo = (parseFloat(custoPlano) / parseFloat(qtdmod)).toFixed(2)
                    var custoPorKwp = (parseFloat(custoPlano) / parseFloat(potencia)).toFixed(2)
                    res.render('relatorios/analisegeral', { potencia, qtdmod, valor, rspkwp, rspmod, rsimod, rsikwp, custoPorModulo, custoPorKwp, mestitulo, ano })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro para encontrar projetos.')
                res.redirect('/menu')
            })
        })
        if (realizado.length == 0) {
            aviso = []
            aviso.push({ texto: 'Nenhum projeto realizado no período de: ' + mestitulo + ' de ' + ano })
            res.render('relatorios/analisegeral', { aviso, mestitulo, ano })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados.')
        res.redirect('/menu')
    })
})

router.post('/filtradash', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var soma_kitfat = 0
    var soma_serfat = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Custos Fixos
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    //----------------------------------------
    //Média ponderada da participação 
    //----------------------------------------
    var soma_totfat_com = 0
    var soma_totfat_sem = 0

    var soma_totcop_com = 0
    var soma_totcop_sem = 0
    var soma_totkit_com = 0

    var soma_totkwp_com = 0
    var soma_totkwp_sem = 0
    var soma_varkwp_com = 0
    var soma_varkwp_sem = 0
    var soma_estkwp_com = 0
    var soma_estkwp_sem = 0

    //Custos Fixos
    var soma_totcus_com = 0
    var soma_totcus_sem = 0
    //Serviço
    var soma_totint_com = 0
    var soma_totint_sem = 0
    var soma_totpro_com = 0
    var soma_totpro_sem = 0
    var soma_totges_com = 0
    var soma_totges_sem = 0
    var soma_totart_com = 0
    var soma_totart_sem = 0
    //Despesas Administrativas
    var soma_totadm_com = 0
    var soma_totadm_sem = 0
    //Comissões
    var soma_totcom_com = 0
    var soma_totcom_sem = 0
    //Tributos
    var soma_tottrb_com = 0
    var soma_tottrb_sem = 0
    //Custos Variáveis
    var soma_totvar_com = 0
    var soma_totvar_sem = 0
    var soma_varfat_com = 0
    var soma_varfat_sem = 0
    var soma_totdes_com = 0
    var soma_totdes_sem = 0
    var soma_totali_com = 0
    var soma_totali_sem = 0
    var soma_totcmb_com = 0
    var soma_totcmb_sem = 0
    var soma_tothtl_com = 0
    var soma_tothtl_sem = 0
    //Custos Variáveis Estruturais
    var soma_totest_com = 0
    var soma_totest_sem = 0
    var soma_estfat_com = 0
    var soma_estfat_sem = 0
    var soma_totcer_com = 0
    var soma_totcer_sem = 0
    var soma_totcen_com = 0
    var soma_totcen_sem = 0
    var soma_totpos_com = 0
    var soma_totpos_sem = 0
    //----------------------------------------

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        var numprj = realizado.length

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            const { custofix } = realizado[i]
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { custovar } = realizado[i]
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { custoest } = realizado[i]
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            //-------------------------------
            //Média ponderada da participação do gastos- INÍCIO
            //-------------------------------
            if (fatequ == true) {

                //numprj_com++

                soma_totkwp_com = (parseFloat(soma_totkwp_com) + parseFloat(potencia)).toFixed(2)
                soma_totcop_com = (parseFloat(soma_totcop_com) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_com = parseFloat(soma_totfat_com) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit_com = parseFloat(soma_totkit_com) + parseFloat(vlrkit)

                //Custos Fixos 
                soma_totcus_com = (parseFloat(soma_totcus_com) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_com = (parseFloat(soma_totint_com) + parseFloat(totint)).toFixed(2)
                soma_totpro_com = (parseFloat(soma_totpro_com) + parseFloat(totpro)).toFixed(2)
                soma_totges_com = (parseFloat(soma_totges_com) + parseFloat(totges)).toFixed(2)
                soma_totart_com = (parseFloat(soma_totart_com) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_com = (parseFloat(soma_tottrb_com) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_com = (parseFloat(soma_totcom_com) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_com = (parseFloat(soma_totadm_com) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_com = parseFloat(soma_varkwp_com) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_com = parseFloat(soma_varfat_com) + parseFloat(vlrNFS)
                    soma_totvar_com = (parseFloat(soma_totvar_com) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_com = (parseFloat(soma_totdes_com) + parseFloat(totdes)).toFixed(2)
                soma_totali_com = (parseFloat(soma_totali_com) + parseFloat(totali)).toFixed(2)
                soma_totcmb_com = (parseFloat(soma_totcmb_com) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_com = (parseFloat(soma_tothtl_com) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_com = parseFloat(soma_estkwp_com) + parseFloat(potencia)
                    soma_estfat_com = parseFloat(soma_estfat_com) + parseFloat(vlrNFS)
                    soma_totest_com = (parseFloat(soma_totest_com) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_com = (parseFloat(soma_totest_com) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + 0).toFixed(2)
                }

            } else {
                //numprj_sem++

                soma_totkwp_sem = (parseFloat(soma_totkwp_sem) + parseFloat(potencia)).toFixed(2)
                soma_totcop_sem = (parseFloat(soma_totcop_sem) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_sem = parseFloat(soma_totfat_sem) + parseFloat(vlrNFS)

                //Custos Fixos 
                soma_totcus_sem = (parseFloat(soma_totcus_sem) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_sem = (parseFloat(soma_totint_sem) + parseFloat(totint)).toFixed(2)
                soma_totpro_sem = (parseFloat(soma_totpro_sem) + parseFloat(totpro)).toFixed(2)
                soma_totges_sem = (parseFloat(soma_totges_sem) + parseFloat(totges)).toFixed(2)
                soma_totart_sem = (parseFloat(soma_totart_sem) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_sem = (parseFloat(soma_tottrb_sem) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_sem = (parseFloat(soma_totcom_sem) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_sem = (parseFloat(soma_totadm_sem) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_sem = parseFloat(soma_varkwp_sem) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_sem = parseFloat(soma_varfat_sem) + parseFloat(vlrNFS)
                    soma_totvar_sem = (parseFloat(soma_totvar_sem) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_sem = (parseFloat(soma_totdes_sem) + parseFloat(totdes)).toFixed(2)
                soma_totali_sem = (parseFloat(soma_totali_sem) + parseFloat(totali)).toFixed(2)
                soma_totcmb_sem = (parseFloat(soma_totcmb_sem) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_sem = (parseFloat(soma_tothtl_sem) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_sem = parseFloat(soma_estkwp_sem) + parseFloat(potencia)
                    soma_estfat_sem = parseFloat(soma_estfat_sem) + parseFloat(vlrNFS)
                    soma_totest_sem = (parseFloat(soma_totest_sem) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_sem = (parseFloat(soma_totest_sem) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + 0).toFixed(2)
                }
            }

            //----------------------------------------
            //Média ponderada da paticipação dos gastos- FIM
            //----------------------------------------

            soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
            soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
            //Totalizador de Faturamento            
            if (fatequ == true) {
                soma_kitfat = parseFloat(soma_kitfat) + parseFloat(vlrNFS)
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)
            } else {
                soma_serfat = parseFloat(soma_serfat) + parseFloat(vlrNFS)
            }

            //Custos Fixos 
            //Serviços
            if (totint > 0) {
                soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
            } else {
                soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
            }
            if (totpro > 0) {
                soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
            } else {
                soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
            }
            if (totges > 0) {
                soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
            } else {
                soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
            }
            if (vlrart > 0) {
                soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
            } else {
                soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
            }
            //Tributos
            soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
            //Comissão
            soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
            //Despesas Administrativas
            if (desAdm != undefined) {
                soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
            }

            //Custos Variáveis
            if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                //console.log('soma_varkwp=>' + soma_varkwp)
                soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
            }
            if (totdes > 0) {
                soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
            } else {
                soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
            }
            if (totali > 0) {
                soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
            } else {
                soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
            }
            if (totcmb > 0) {
                soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
            } else {
                soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
            }
            if (tothtl > 0) {
                soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
            } else {
                soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
            }

            //Custos Variáveis Estruturais
            if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
            }

            soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
            soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
            soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)

            if (parseFloat(valorMod) > 0) {
                soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
            }
            //console.log('soma_equkwp=>'+soma_equkwp)
            //Soma percentuais componentes
            //console.log('valorMod=>' + valorMod)
            if (valorMod != undefined) {
                soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
            }
            //console.log('soma_modequ=>' + soma_modequ)
            //console.log('valorInv=>' + valorInv)
            if (valorInv != undefined) {
                soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
            }
            //console.log('soma_invequ=>' + soma_invequ)
            //console.log('valorEst=>' + valorEst)
            if (valorEst != undefined) {
                soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
            }
            //console.log('soma_estequ=>' + soma_estequ)
            //console.log('valorCab=>' + valorCab)
            if (valorCab != undefined) {
                soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
            }
            //console.log('soma_cabequ=>' + soma_cabequ)
            //console.log('valorDis=>' + valorDis)
            if (valorDis != undefined) {
                soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
            }
            //console.log('soma_disequ=>' + soma_disequ)
            //console.log('valorDPS=>' + valorDPS)
            if (valorDPS != undefined) {
                soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
            }
            //console.log('soma_dpsequ=>' + soma_dpsequ)
            //console.log('valorSB=>' + valorSB)
            if (valorSB != undefined) {
                soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
            }
            //console.log('soma_sbxequ=>' + soma_sbxequ)
            //console.log('valorOcp=>' + valorOcp)
            if (valorOcp != undefined) {
                soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
            }
            //console.log('soma_ocpequ=>' + soma_ocpequ)

            //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
            soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
            soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
        }


        //Média Ponderada projetista
        var per_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totpro_com)) {
            per_totpro_com = 0
        }
        var per_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totpro_sem)) {
            per_totpro_sem = 0
        }
        var medkwp_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totpro_com)) {
            medkwp_totpro_com = 0
        }
        var medkwp_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totpro_sem)) {
            medkwp_totpro_sem = 0
        }
        var per_totpro = (((parseFloat(medkwp_totpro_com) * parseFloat(per_totpro_com)) + (parseFloat(medkwp_totpro_sem) * parseFloat(per_totpro_sem))) / (parseFloat(medkwp_totpro_com) + parseFloat(medkwp_totpro_sem))).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        //Média Ponderada ART
        var per_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totart_com)) {
            per_totart_com = 0
        }
        var per_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totart_sem)) {
            per_totart_sem = 0
        }
        var medkwp_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totart_com)) {
            medkwp_totart_com = 0
        }
        var medkwp_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totart_sem)) {
            medkwp_totart_sem = 0
        }
        var per_totart = (((parseFloat(medkwp_totart_com) * parseFloat(per_totart_com)) + (parseFloat(medkwp_totart_sem) * parseFloat(per_totart_sem))) / (parseFloat(medkwp_totart_com) + parseFloat(medkwp_totart_sem))).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        //Média Ponderada Gestão
        var per_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totges_com)) {
            per_totges_com = 0
        }
        var per_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totges_sem)) {
            per_totges_sem = 0
        }
        var medkwp_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totges_com)) {
            medkwp_totges_com = 0
        }
        var medkwp_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totges_sem)) {
            medkwp_totges_sem = 0
        }
        var per_totges = (((parseFloat(medkwp_totges_com) * parseFloat(per_totges_com)) + (parseFloat(medkwp_totges_sem) * parseFloat(per_totges_sem))) / (parseFloat(medkwp_totges_com) + parseFloat(medkwp_totges_sem))).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        //Média Ponderada instalação
        var per_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totint_com)) {
            per_totint_com = 0
        }
        var per_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totint_sem)) {
            per_totint_sem = 0
        }
        var medkwp_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totint_com)) {
            medkwp_totint_com = 0
        }
        var medkwp_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totint_sem)) {
            medkwp_totint_sem = 0
        }
        var per_totint = (((parseFloat(medkwp_totint_com) * parseFloat(per_totint_com)) + (parseFloat(medkwp_totint_sem) * parseFloat(per_totint_sem))) / (parseFloat(medkwp_totint_com) + parseFloat(medkwp_totint_sem))).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        //Média Ponderada Administração
        var per_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totadm_com)) {
            per_totadm_com = 0
        }
        var per_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totadm_sem)) {
            per_totadm_sem = 0
        }
        var medkwp_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totadm_com)) {
            medkwp_totadm_com = 0
        }
        var medkwp_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totadm_sem)) {
            medkwp_totadm_sem = 0
        }
        var per_totadm = (((parseFloat(medkwp_totadm_com) * parseFloat(per_totadm_com)) + (parseFloat(medkwp_totadm_sem) * parseFloat(per_totadm_sem))) / (parseFloat(medkwp_totadm_com) + parseFloat(medkwp_totadm_sem))).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        //Média Ponderada Comissão
        var per_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcom_com)) {
            per_totcom_com = 0
        }
        var per_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcom_sem)) {
            per_totcom_sem = 0
        }
        var medkwp_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcom_com)) {
            medkwp_totcom_com = 0
        }
        var medkwp_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcom_sem)) {
            medkwp_totcom_sem = 0
        }
        var per_totcom = (((parseFloat(medkwp_totcom_com) * parseFloat(per_totcom_com)) + (parseFloat(medkwp_totcom_sem) * parseFloat(per_totcom_sem))) / (parseFloat(medkwp_totcom_com) + parseFloat(medkwp_totcom_sem))).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        //Média Ponderada Tributos
        var per_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_tottrb_com)) {
            per_tottrb_com = 0
        }
        var per_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_tottrb_sem)) {
            per_tottrb_sem = 0
        }
        var medkwp_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_tottrb_com)) {
            medkwp_tottrb_com = 0
        }
        var medkwp_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_tottrb_sem)) {
            medkwp_tottrb_sem = 0
        }
        var per_tottrb = (((parseFloat(medkwp_tottrb_com) * parseFloat(per_tottrb_com)) + (parseFloat(medkwp_tottrb_sem) * parseFloat(per_tottrb_sem))) / (parseFloat(medkwp_tottrb_com) + parseFloat(medkwp_tottrb_sem))).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        //Total Custos
        var custoFix_com = parseFloat(soma_totcus_com) + parseFloat(soma_totadm_com) + parseFloat(soma_totcom_com) + parseFloat(soma_tottrb_com)
        var custoFix_sem = parseFloat(soma_totcus_sem) + parseFloat(soma_totadm_sem) + parseFloat(soma_totcom_sem) + parseFloat(soma_tottrb_sem)
        var per_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcus_com)) {
            per_totcus_com = 0
        }
        var per_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcus_sem)) {
            per_totcus_sem = 0
        }
        var medkwp_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcus_com)) {
            medkwp_totcus_com = 0
        }
        var medkwp_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcus_sem)) {
            medkwp_totcus_sem = 0
        }
        var per_totcus = (((parseFloat(medkwp_totcus_com) * parseFloat(per_totcus_com)) + (parseFloat(medkwp_totcus_sem) * parseFloat(per_totcus_sem))) / (parseFloat(medkwp_totcus_com) + parseFloat(medkwp_totcus_sem))).toFixed(2)
        if (isNaN(per_totcus)) {
            per_totcus = 0
        }
        //Média Ponderada Custos Variáveis Alimentação
        var per_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totali_com)) {
            per_totali_com = 0
        }
        var per_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totali_sem)) {
            per_totali_sem = 0
        }
        var medkwp_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totali_com)) {
            medkwp_totali_com = 0
        }
        var medkwp_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totali_sem)) {
            medkwp_totali_sem = 0
        }
        var per_totali = (((parseFloat(medkwp_totali_com) * parseFloat(per_totali_com)) + (parseFloat(medkwp_totali_sem) * parseFloat(per_totali_sem))) / (parseFloat(medkwp_totali_com) + parseFloat(medkwp_totali_sem))).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        //Média Ponderada Custos Variáveis Deslocamento
        var per_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totdes_com)) {
            per_totdes_com = 0
        }
        var per_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totdes_sem)) {
            per_totdes_sem = 0
        }
        var medkwp_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totdes_com)) {
            medkwp_totdes_com = 0
        }
        var medkwp_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totdes_sem)) {
            medkwp_totdes_sem = 0
        }
        var per_totdes = (((parseFloat(medkwp_totdes_com) * parseFloat(per_totdes_com)) + (parseFloat(medkwp_totdes_sem) * parseFloat(per_totdes_sem))) / (parseFloat(medkwp_totdes_com) + parseFloat(medkwp_totdes_sem))).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        //Média Ponderada Custos Variáveis Combustível
        var per_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totcmb_com)) {
            per_totcmb_com = 0
        }
        var per_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totcmb_sem)) {
            per_totcmb_sem = 0
        }
        var medkwp_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totcmb_com)) {
            medkwp_totcmb_com = 0
        }
        var medkwp_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totcmb_sem)) {
            medkwp_totcmb_sem = 0
        }
        var per_totcmb = (((parseFloat(medkwp_totcmb_com) * parseFloat(per_totcmb_com)) + (parseFloat(medkwp_totcmb_sem) * parseFloat(per_totcmb_sem))) / (parseFloat(medkwp_totcmb_com) + parseFloat(medkwp_totcmb_sem))).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        //Média Ponderada Custos Variáveis Hotel
        var per_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_tothtl_com)) {
            per_tothtl_com = 0
        }
        var per_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_tothtl_sem)) {
            per_tothtl_sem = 0
        }
        var medkwp_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_tothtl_com)) {
            medkwp_tothtl_com = 0
        }
        var medkwp_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_tothtl_sem)) {
            medkwp_tothtl_sem = 0
        }
        var per_tothtl = (((parseFloat(medkwp_tothtl_com) * parseFloat(per_tothtl_com)) + (parseFloat(medkwp_tothtl_sem) * parseFloat(per_tothtl_sem))) / (parseFloat(medkwp_tothtl_com) + parseFloat(medkwp_tothtl_sem))).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        //Total Custos Variáveis
        var custoVar_com = parseFloat(soma_totvar_com)
        var custoVar_sem = parseFloat(soma_totvar_sem)
        var per_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totvar_com)) {
            per_totvar_com = 0
        }
        var per_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totvar_sem)) {
            per_totvar_sem = 0
        }
        var medkwp_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totvar_com)) {
            medkwp_totvar_com = 0
        }
        var medkwp_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totvar_sem)) {
            medkwp_totvar_sem = 0
        }
        var per_totvar = (((parseFloat(medkwp_totvar_com) * parseFloat(per_totvar_com)) + (parseFloat(medkwp_totvar_sem) * parseFloat(per_totvar_sem))) / (parseFloat(medkwp_totvar_com) + parseFloat(medkwp_totvar_sem))).toFixed(2)
        if (isNaN(per_totvar)) {
            per_totvar = 0
        }
        //Média Ponderada Variáveis Estruturais Cercamento  
        var per_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcer_com)) {
            per_totcer_com = 0
        }
        var per_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcer_sem)) {
            per_totcer_sem = 0
        }
        var medkwp_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcer_com)) {
            medkwp_totcer_com = 0
        }
        var medkwp_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcer_sem)) {
            medkwp_totcer_sem = 0
        }
        var per_totcer = (((parseFloat(medkwp_totcer_com) * parseFloat(per_totcer_com)) + (parseFloat(medkwp_totcer_sem) * parseFloat(per_totcer_sem))) / (parseFloat(medkwp_totcer_com) + parseFloat(medkwp_totcer_sem))).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        //Média Ponderada Variáveis Estruturais Central
        var per_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcen_com)) {
            per_totcen_com = 0
        }
        var per_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcen_sem)) {
            per_totcen_sem = 0
        }
        var medkwp_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcen_com)) {
            medkwp_totcen_com = 0
        }
        var medkwp_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcen_sem)) {
            medkwp_totcen_sem = 0
        }
        var per_totcen = (((parseFloat(medkwp_totcen_com) * parseFloat(per_totcen_com)) + (parseFloat(medkwp_totcen_sem) * parseFloat(per_totcen_sem))) / (parseFloat(medkwp_totcen_com) + parseFloat(medkwp_totcen_sem))).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        //Média Ponderada Variáveis Estruturais Postes
        var per_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totpos_com)) {
            per_totpos_com = 0
        }
        var per_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totpos_sem)) {
            per_totpos_sem = 0
        }
        var medkwp_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totpos_com)) {
            medkwp_totpos_com = 0
        }
        var medkwp_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totpos_sem)) {
            medkwp_totpos_sem = 0
        }
        var per_totpos = (((parseFloat(medkwp_totpos_com) * parseFloat(per_totpos_com)) + (parseFloat(medkwp_totpos_sem) * parseFloat(per_totpos_sem))) / (parseFloat(medkwp_totpos_com) + parseFloat(medkwp_totpos_sem))).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        //Total Custos Variáveis Estruturais
        var custoEst_com = parseFloat(soma_totest_com)
        if (isNaN(custoEst_com)) {
            custoEst_com = 0
        }
        var custoEst_sem = parseFloat(soma_totest_sem)
        if (isNaN(custoEst_sem)) {
            custoEst_sem = 0
        }
        var per_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totest_com)) {
            per_totest_com = 0
        }
        var per_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totest_sem)) {
            per_totest_sem = 0
        }
        var medkwp_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totest_com)) {
            medkwp_totest_com = 0
        }
        var medkwp_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totest_sem)) {
            medkwp_totest_sem = 0
        }
        var per_totest = (((parseFloat(medkwp_totest_com) * parseFloat(per_totest_com)) + (parseFloat(medkwp_totest_sem) * parseFloat(per_totest_sem))) / (parseFloat(medkwp_totest_com) + parseFloat(medkwp_totest_sem))).toFixed(2)
        if (isNaN(per_totest)) {
            per_totest = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)
        soma_totfat = parseFloat(soma_kitfat) + parseFloat(soma_serfat)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        //Custos Variáveis Estruturais
        medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_custoEst)) {
            medkwp_custoEst = 0
        }
        medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
        medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
        medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)

        //medkwp_serfat = parseFloat(soma_serfat) / parseFloat(soma_serkwp)
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustos', {
            mestitulo, ano,
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_custoEst,

            per_totint, per_totpro, per_totart, per_totges, per_totadm, per_tottrb, per_totcom, per_totcus, per_totvar,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_totvar,
            per_totcer, per_totcen, per_totpos, per_totest,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ,
        })
    })
})

router.post('/filtradashcomkit', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            if (fatequ == true) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }

        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustoscomkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat, medkwp_totkit,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            mestitulo, ano,
            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })
    })
})

router.post('/filtradashsemkit', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            //Contar projetos por mês
            /*
            const { datareg } = realizado[i]

            if (datareg != undefined) {
                //Janeiro
                if (datareg >= 20210101 && datareg <= 20210131) {
                    prjjan += 1
                }
                //Fevereiro
                if (datareg >= 20210201 && datareg <= 20210228) {
                    prjfev += 1
                }
                //Março
                if (datareg >= 20210301 && datareg <= 20210331) {
                    prjmar += 1
                }
                //Abril
                if (datareg >= 20210401 && datareg <= 20210430) {
                    prjabr += 1
                }
                //Maio
                if (datareg >= 20210501 && datareg <= 20210530) {
                    prjmai = +1
                }
                //Junho
                if (datareg >= 20210601 && datareg <= 20210631) {
                    prjjun = +1
                }
                //Julho
                if (datareg >= 20210701 && datareg <= 20210730) {
                    prjjul = +1
                }
                //Agosto
                if (datareg >= 20210801 && datareg <= 20210831) {
                    prjago = +1
                }
                //Setembro
                if (datareg >= 20210901 && datareg <= 20210930) {
                    prjset = +1
                }
                //Outubro
                if (datareg >= 20211001 && datareg <= 20211031) {
                    prjout = +1
                }
                //Novembro
                if (datareg >= 20211101 && datareg <= 20211130) {
                    prjnov = +1
                }
                //Dezembro
                if (datareg >= 20211201 && datareg <= 20211231) {
                    prjdez = +1
                }
            }
            */

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            if (fatequ == false) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }

        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustossemkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_custoVar,
            medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            mestitulo, ano,
            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })
    })
})

router.post('/filtrarReal', ehAdmin, (req, res) => {
    const { _id } = req.user
    var data = new Date()
    var ano = data.getFullYear()
    var dataini
    var datafim

    if (req.body.dataini == '' && req.body.dataini == '') {

        switch (req.body.filtromes) {
            case 'Janeiro':
                dataini = ano + '01' + '01'
                datafim = ano + '01' + '31'
                break;
            case 'Fevereiro':
                dataini = ano + '02' + '01'
                datafim = ano + '02' + '28'
                break;
            case 'Março':
                dataini = ano + '03' + '01'
                datafim = ano + '03' + '31'
                break;
            case 'Abril':
                dataini = ano + '04' + '01'
                datafim = ano + '04' + '30'
                break;
            case 'Maio':
                dataini = ano + '05' + '01'
                datafim = ano + '05' + '31'
                break;
            case 'Junho':
                dataini = ano + '06' + '01'
                datafim = ano + '06' + '30'
                break;
            case 'Julho':
                dataini = ano + '07' + '01'
                datafim = ano + '07' + '31'
                break;
            case 'Agosto':
                dataini = ano + '08' + '01'
                datafim = ano + '08' + '30'
                break;
            case 'Setembro':
                dataini = ano + '09' + '01'
                datafim = ano + '09' + '31'
                break;
            case 'Outubro':
                dataini = ano + '10' + '01'
                datafim = ano + '10' + '31'
                break;
            case 'Novembro':
                dataini = ano + '11' + '01'
                datafim = ano + '11' + '30'
                break;
            case 'Dezembro':
                dataini = ano + '12' + '01'
                datafim = ano + '12' + '31'
                break;
            default:
                dataini = ano + '01' + '01'
                datafim = ano + '12' + '31'
        }
    } else {

        var dataini = req.body.dataini
        var diaini = dataini.substring(0, 2)
        var mesini = dataini.substring(3, 5)
        var anoini = dataini.substring(6, 10)
        dataini = anoini + mesini + diaini
        //console.log('diaini=>'+dataini)
        var datafim = req.body.datafim
        var diafim = datafim.substring(0, 2)
        var mesfim = datafim.substring(3, 5)
        var anofim = datafim.substring(6, 10)
        datafim = anofim + mesfim + diafim
        //console.log('datafim=>'+datafim)
    }

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        var dia = parseFloat(data.getDate())
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }
        var ano = data.getFullYear()
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = realizado.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < realizado.length; i++) {
            const { valor } = realizado[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = realizado[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = realizado[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = realizado[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroBruto } = realizado[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = realizado[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = realizado[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        var diaIni = dataini.substring(6, 8)
        var mesIni = dataini.substring(4, 6)
        var anoIni = dataini.substring(0, 4)
        dataInicio = diaIni + '/' + mesIni + '/' + anoIni
        var diaFim = datafim.substring(6, 8)
        var mesFim = datafim.substring(4, 6)
        var anoFim = datafim.substring(0, 4)
        dataFim = diaFim + '/' + mesFim + '/' + anoFim

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_lbaimp: soma_lbaimp, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb, dataInicio: dataInicio, dataFim: dataFim })
    })

})

router.post('/filtrarAberto', ehAdmin, (req, res) => {

    const { _id } = req.user
    var data = new Date()
    var ano = data.getFullYear()
    var dataini
    var datafim

    if (req.body.dataini == '' && req.body.dataini == '') {

        switch (req.body.filtromes) {
            case 'Janeiro':
                dataini = ano + '01' + '01'
                datafim = ano + '01' + '31'
                break;
            case 'Fevereiro':
                dataini = ano + '02' + '01'
                datafim = ano + '02' + '28'
                break;
            case 'Março':
                dataini = ano + '03' + '01'
                datafim = ano + '03' + '31'
                break;
            case 'Abril':
                dataini = ano + '04' + '01'
                datafim = ano + '04' + '30'
                break;
            case 'Maio':
                dataini = ano + '05' + '01'
                datafim = ano + '05' + '31'
                break;
            case 'Junho':
                dataini = ano + '06' + '01'
                datafim = ano + '06' + '30'
                break;
            case 'Julho':
                dataini = ano + '07' + '01'
                datafim = ano + '07' + '31'
                break;
            case 'Agosto':
                dataini = ano + '08' + '01'
                datafim = ano + '08' + '30'
                break;
            case 'Setembro':
                dataini = ano + '09' + '01'
                datafim = ano + '09' + '31'
                break;
            case 'Outubro':
                dataini = ano + '10' + '01'
                datafim = ano + '10' + '31'
                break;
            case 'Novembro':
                dataini = ano + '11' + '01'
                datafim = ano + '11' + '30'
                break;
            case 'Dezembro':
                dataini = ano + '12' + '01'
                datafim = ano + '12' + '31'
                break;
            default:
                dataini = ano + '01' + '01'
                datafim = ano + '12' + '31'
        }
    } else {
        dataini = req.body.dataini
        var diaini = dataini.substring(0, 2)
        var mesini = dataini.substring(3, 5)
        var anoini = dataini.substring(6, 10)
        dataini = anoini + mesini + diaini
        //console.log('diaini=>'+dataini)
        datafim = req.body.datafim
        var diafim = datafim.substring(0, 2)
        var mesfim = datafim.substring(3, 5)
        var anofim = datafim.substring(6, 10)
        datafim = anofim + mesfim + diafim
        //console.log('datafim=>'+datafim)
    }

    //console.log('datafim=>' + datafim)
    //console.log('dataini=>' + dataini)
    Projetos.find({ 'dataord': { $lte: datafim, $gte: dataini }, user: _id, foiRealizado: false }).lean().then((projetos) => {

        var dia = data.getDate()
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }

        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = projetos.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < projetos.length; i++) {
            const { valor } = projetos[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = projetos[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = projetos[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)            
            const { lucroBruto } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = projetos[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = projetos[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        var diaIni = dataini.substring(6, 8)
        var mesIni = dataini.substring(4, 6)
        var anoIni = dataini.substring(0, 4)
        dataInicio = diaIni + '/' + mesIni + '/' + anoIni
        var diaFim = datafim.substring(6, 8)
        var mesFim = datafim.substring(4, 6)
        var anoFim = datafim.substring(0, 4)
        dataFim = diaFim + '/' + mesFim + '/' + anoFim

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_lbaimp: soma_lbaimp, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb, dataInicio: dataInicio, dataFim: dataFim })
    })

})

router.post('/filtraInstalador', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    const { ehAdmin } = req.user
    const { owner } = req.user
    const { pessoa } = req.user
    var id
    var q = 0

    var listaAberto = []
    var listaEncerrado = []
    var clientes = []

    if (naoVazio(user)) {
        id = user
        sql = { user: id, responsavel: pessoa }
    } else {
        id = _id
        sql = { user: id }
    }

    var hoje = dataHoje()
    var ano = hoje.substring(0, 4)

    if (ehAdmin == 0) {
        ehMaster = true
    } else {
        ehMaster = false
    }

    var data = new Date()
    var hora = data.getHours()

    //ajuste da hora no servidor para horário do cliente brasília
    hora = hora - 3

    if (hora >= 18 && hora <= 24) {
        saudacao = 'Boa Noite '
    }
    if (hora >= 12 && hora < 18) {
        saudacao = 'Boa tarde '
    }
    if (hora >= 0 && hora < 12) {
        saudacao = 'Bom dia '
    }

    Equipe.find({ user: id, insres: pessoa, feito: true, liberar: true, nome_projeto: { $exists: true }, $and: [{ 'dtinicio': { $ne: '' } }, { 'dtinicio': { $ne: '0000-00-00' } }] }).then((equipe) => {
        Pessoa.findOne({ _id: pessoa }).then((pes_ins) => {
            //console.log('pessoa.nome=>'+pessoa.nome)
            equipe.forEach((e) => {
                Projeto.findOne({ equipe: e._id }).then((projeto) => {
                    Cliente.findOne({ _id: projeto.cliente }).then((cliente) => {
                        console.log('cliente.nome =>' + cliente.nome)
                        console.log('req.body.cliente =>' + req.body.cliente)
                        clientes.push({ id: cliente.id, nome: cliente.nome })
                        if (cliente._id == req.body.cliente) {
                            if (e.prjFeito == 'true') {
                                listaEncerrado.push({ id: projeto._id, seq: projeto.seq, cliente: cliente.nome, endereco: projeto.endereco, cidade: projeto.cidade, uf: projeto.uf, dtini: dataMensagem(e.dtinicio), dtfim: dataMensagem(e.dtfim) })
                            } else {
                                listaAberto.push({ id: projeto._id, seq: projeto.seq, cliente: cliente.nome, endereco: projeto.endereco, cidade: projeto.cidade, uf: projeto.uf, dtini: dataMensagem(e.dtinicio), dtfim: dataMensagem(e.dtfim) })
                            }
                        }
                        q++
                        if (q == equipe.length) {
                            res.render('dashboard', { id: _id, instalador: true, vendedor: false, orcamentista: false, ehMaster, owner: owner, ano, block: true, nome: pes_ins.nome, clientes, listaAberto, listaEncerrado })
                        }
                    })
                })
            })
        })
    })
})

router.post('/filtrar', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    const { funges } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var lista = []

    var dtcadastro = '0000-00-00'
    var dtinicio = '0000-00-00'
    var dtfim = '0000-00-00'
    var dataini = 0
    var datafim = 0
    var busca = {}
    var sql = {}
    var stats
    var valor = 0
    var total = 0
    var check2030 = ''
    var check3050 = ''
    var check50100 = ''
    var check100 = ''
    var checktudo = ''
    var filtravlr = String(req.body.valor)
    filtravlr = filtravlr.replace(',on', '')
    var sqlvlr = {}

    var funcaoGes

    var q = 0

    //console.log('req.body.dataini=>' + req.body.dataini)
    //console.log('req.body.datafim=>' + req.body.datafim)

    if (req.body.dataini == '' || req.body.datafim == '' || (dataBusca(req.body.dataini) > dataBusca(req.body.datafim))) {
        req.flash('error_msg', 'Verificar as datas de busca escolhidas.')
        res.redirect('/dashboard/')
    }

    console.log('filtravlr=>' + filtravlr)

    switch (filtravlr) {
        case '2030': sqlvlr = { 'valor': { $gte: 20000, $lte: 30000 } }
            check2030 = 'checked'
            break;
        case '3050': sqlvlr = { 'valor': { $gte: 30000, $lte: 50000 } }
            check3050 = 'checked'
            break;
        case '50100': sqlvlr = { 'valor': { $gte: 50000, $lte: 100000 } }
            check50100 = 'checked'
            break;
        case '100': sqlvlr = { 'valor': { $gte: 100000 } }
            check100 = 'checked'
            break;
        default: sqlvlr = {}
            checktudo = 'checked'
            break;
    }

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, vendedor: 'checked' }).lean().then((todos_vendedores) => {
            stats = req.body.stats
            cliente = req.body.cliente
            vendedor = req.body.vendedor

            //console.log('stats=>' + req.body.stats)
            //console.log('cliente=>' + req.body.cliente)
            //console.log('vendedor=>' + req.body.vendedor)

            dataini = dataBusca(req.body.dataini)
            datafim = dataBusca(req.body.datafim)
            //console.log('req.body.tipo=>' + req.body.tipo)

            if (vendedor != 'Todos' && cliente != 'Todos' && stats != 'Todos') {
                sql = { user: id, cliente: cliente, vendedor: vendedor, status: stats }
            } else {
                if (vendedor != 'Todos' && cliente != 'Todos' && stats == 'Todos') {
                    sql = { user: id, cliente: cliente, vendedor: vendedor }
                } else {
                    if (vendedor != 'Todos' && cliente == 'Todos' && stats == 'Todos') {
                        sql = { user: id, vendedor: vendedor }
                    } else {
                        if (vendedor == 'Todos' && cliente != 'Todos' && stats == 'Todos') {
                            sql = { user: id, cliente: cliente }
                        } else {
                            if (vendedor == 'Todos' && cliente == 'Todos' && stats != 'Todos') {
                                if (stats == 'Negociando') {
                                    sql = { user: id, $or: [{ status: 'Negociando' }, { status: 'Analisando Financiamento' }, { status: 'Comparando Propostas' }, { status: 'Aguardando redução de preço' }] }
                                } else {
                                    sql = { user: id, status: stats }
                                }
                            } else {
                                if (vendedor != 'Todos' && cliente == 'Todos' && stats != 'Todos') {
                                    if (stats == 'Negociando') {
                                        sql = { user: id, vendedor: vendedor, $or: [{ status: 'Negociando' }, { status: 'Analisando Financiamento' }, { status: 'Comparando Propostas' }, { status: 'Aguardando redução de preço' }] }
                                    } else {
                                        sql = { user: id, vendedor: vendedor, status: stats }
                                    }
                                } else {
                                    if (vendedor == 'Todos' && cliente != 'Todos' && stats != 'Todos') {
                                        if (stats == 'Negociando') {
                                            sql = { user: id, cliente: cliente, $or: [{ status: 'Negociando' }, { status: 'Analisando Financiamento' }, { status: 'Comparando Propostas' }, { status: 'Aguardando redução de preço' }] }
                                        } else {
                                            sql = { user: id, cliente: cliente, status: stats }
                                        }
                                    } else {
                                        sql = { user: id }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (naoVazio(dataini) && naoVazio(datafim)) {
                var data = { 'datacad': { $lte: datafim, $gte: dataini } }
            }
            //console.log('sql=>' + JSON.stringify(sql))
            Object.assign(busca, sql, data, sqlvlr)
            //console.log('data=>' + JSON.stringify(data))
            console.log('busca=>' + JSON.stringify(busca))

            Projeto.find(busca).sort({ 'data': -1 }).then((projeto) => {
                //console.log('projeto=>' + projeto)
                if (naoVazio(projeto)) {
                    projeto.forEach((e) => {
                        Cliente.findOne({ _id: e.cliente }).then((prj_cliente) => {
                            Pessoa.findOne({ _id: e.vendedor }).then((prj_vendedor) => {
                                q++
                                //console.log('e.datacad=>' + e.datacad)
                                if (naoVazio(e.datacad)) {
                                    dtcadastro = e.datacad
                                } else {
                                    dtcadastro = '00000000'
                                }

                                if (naoVazio(e.dtinicio)) {
                                    dtinicio = e.dtinicio
                                } else {
                                    dtinicio = '0000-00-00'
                                }

                                if (naoVazio(e.dtfim)) {
                                    dtfim = e.dtfim
                                } else {
                                    dtfim = '0000-00-00'
                                }

                                if (naoVazio(prj_vendedor)) {
                                    nome_vendedor = prj_vendedor.nome
                                } else {
                                    nome_vendedor = ''
                                }

                                //console.log('valor=>' + valor)
                                if (naoVazio(e.valor)) {
                                    total = total + e.valor
                                    valor = e.valor
                                } else {
                                    valor = 0
                                }

                                lista.push({ s: e.status, id: e._id, seq: e.seq, uf: e.uf, cidade: e.cidade, dataini, datafim, valor: mascaraDecimal(valor), cliente: prj_cliente.nome, nome_vendedor, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })

                                if (q == projeto.length) {
                                    //console.log(lista)
                                    if (naoVazio(user) == false) {
                                        funcaoGes = true
                                    } else {
                                        funcaoGes = funges
                                    }
                                    res.render('principal/consulta', {
                                        qtd: q, lista, todos_clientes, todos_vendedores, dataini, datafim, total: mascaraDecimal(total), stats, cliente, inicio: dataini, fim: datafim, mostrar: '',
                                        check2030, check3050, check50100, check100, checktudo, funges: funcaoGes
                                    })
                                }

                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum vendedor encontrado.')
                                res.redirect('/dashboard')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum cliente encontrado.')
                            res.redirect('/dashboard')
                        })
                    })
                } else {
                    if (naoVazio(user) == false) {
                        funcaoGes = true
                    } else {
                        funcaoGes = funges
                    }
                    req.flash('aviso_msg', 'Não existem registros no sistema.')
                    res.render('principal/consulta', {
                        lista, todos_clientes, todos_vendedores, stats, cliente, inicio: dataini, fim: datafim, mostrar: '',
                        check2030, check3050, check50100, check100, checktudo, funges: funcaoGes
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum projeto encontrado.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum vendedor encontrado.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        res.redirect('/dashboard')
    })
})

module.exports = router