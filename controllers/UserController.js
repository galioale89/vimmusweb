const mongoose = require('mongoose')
const Usuarios = mongoose.model('usuario')

class UserController {
    async index(req,res){
        let data = await Usuarios.find()
        console.log(data)
        return res.send(data)
    }    
}

module.exports = new UserController()
