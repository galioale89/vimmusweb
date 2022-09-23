const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model Usuario
require("../model/Usuario")
require("../model/Acesso")
const Usuario = mongoose.model("usuario")
const Acesso = mongoose.model("acesso")

module.exports = (passport) => {

    passport.use(new localStrategy({ usernameField: 'usuario', passwordField: 'senha' }, (usuario, senha, done) => {
        Usuario.findOne({ usuario: usuario }).then((user) => {
            if (!user) {
                Acesso.findOne({ usuario: usuario }).then((user) => {
                    if (!user) {
                        return done(null, false, { message: "Esta conta não existe" })
                    } else {
                        bcrypt.compare(senha, user.senha, (erro, batem) => {
                            if (batem) {
                                return done(null, user)
                            } else {
                                return done(null, false, { message: "Senha incorreta" })
                            }

                        })
                    }
                })
            } else {
                bcrypt.compare(senha, user.senha, (erro, batem) => {
                    if (batem) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Senha incorreta" })
                    }
                })
            }

        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((_id, done) => {
        Usuario.findOne({_id: _id}).then((usuario)=>{
            if (!usuario){
                Acesso.findById(_id, (err, usuario) => {
                    done(err, usuario)
                })
            }else{
                Usuario.findById(_id, (err, usuario) => {
                    done(err, usuario)
                })                
            }
        })
    })
}

