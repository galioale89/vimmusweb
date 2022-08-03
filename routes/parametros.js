const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Parametros')
const Parametros = mongoose.model('parametros')
const naoVazio = require('../resources/naoVazio')
const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/novo/', ehAdmin, (req, res) => {

    const { _id } = req.user
    const { user } = req.user
    var id
    // var sql = {}
    // var view

    if (naoVazio(user)) {
        id = user
    } else {
        id = _id
    }

    // if (req.params.tipo == 'solar') {
    //     sql = { user: id, tipo: 'solar' }
    //     view = 'principal/paramsSolar'
    // } else {
    //     if (req.params.tipo == 'ar') {
    //         sql = { user: id, tipo: 'ar' }
    //         view = 'principal/paramsAr'
    //     } else {
    //         sql = { user: id, tipo: 'camara' }
    //         view = 'principal/paramsCamara'
    //     }
    // }
    Parametros.find({ user: id }).lean().then((params) => {
        console.log(params)
        if (naoVazio(params)) {
            res.render('principal/paramsSolar', { params })
        } else {
            res.render('principal/paramsSolar')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar os parâmetros.')
        res.redirect('/dashboard')
    })

})

router.get('/edicao/:id', ehAdmin, (req, res) => {
    Parametros.findOne({ _id: req.params.id }).lean().then((parametros) => {
        res.render('parametros/cadastro', { parametros })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o parâmetro.')
        res.redirect('/dashboard')
    })
})

router.get('/consulta/', ehAdmin, (req, res) => {
    Parametros.find().lean().then((parametros) => {
        res.render('parametros/findcomponente', { parametros })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o parâmetro.')
        res.redirect('/dashboard')
    })
})

router.post('/salvar', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var erro = ''

    if (req.body.descricao == '') {
        erro = erro + 'É necessário incluir a descrição do parâmetro. '
    }
    if (erro != '') {
        req.flash('error_msg', erro)
        res.redirect('/dashboard')
    } else {
        console.log('req.body.id=>' + req.body.id)
        // if (req.body.id != '') {
        //     // console.log('entrou')
        //     Parametros.findOne({ _id: req.body.id }).then((parametros) => {
        //         parametros.descricao = req.body.descricao
        //         parametros.valor = req.body.valor
        //         tipo.valor = req.body.tipo
        //         opcao.valor = req.body.opcao
        //         parametros.save().then(() => {
        //             req.flash('success_msg', 'Parâmetro salvo com sucesso.')
        //             res.redirect('/parametros/novo/' + req.body.id)
        //         }).catch((err) => {
        //             req.flash('error_msg', 'Não foi possível salvar o parâmetro.')
        //             res.redirect('/dashboard')
        //         })
        //     }).catch((err) => {
        //         req.flash('error_msg', 'Não foi possível encontrar o parâmetro.')
        //         res.redirect('/dashboard')
        //     })
        // } else {
        console.log('entrou')
        const comp = {
            user: id,
            descricao: req.body.descricao,
            valor: req.body.valor,
            tipo: req.body.tipo,
            opcao: req.body.opcao,
        }

        new Parametros(comp).save().then(() => {
            console.log('req.params.tipo=>' + req.body.tipo)
            req.flash('success_msg', 'Parâmetro adicionado com sucesso.')
            res.redirect('/parametros/novo/')
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível salvar o parâmetro.')
            res.redirect('/dashboard')
        })
        //}
    }
})

router.get('/deletar/:id', ehAdmin, (req, res) => {
    Parametros.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Parâmetro removido.')
        res.redirect('/parametros/novo/')
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o parâmetro.')
        res.redirect('/parametros/novo/')
    })
})

module.exports = router