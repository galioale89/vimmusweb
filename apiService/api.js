// const http = require('http');
// const express = require('express');
// const cors = require('cors')
// const app = express();
// const mongoose = require('mongoose')
// require('../model/Projeto')
// const cliente = mongoose.model('cliente')


// mongoose.connect('mongodb://vimmus01:64l10770@mongo71-farm10.kinghost.net/vimmus01', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log("Sucesso ao se conectar no app")
// }).catch((err) => {
//     console.log('Falha ao conectar no banco de dados ', err)
// })

// app.use(cors());
// app.use(express.json());

class ListInput {
    constructor(mongoose, app) {
        this.app = app;
        this.mongoose = mongoose;
    }

    async getClients(id, vendedor) {
        var sql = {}
        this.app.get('/clients', (req, res) => {
            const client = this.mongoose.model('cliente')

            const allClients = new Promise((resolve, reject) => {
                // const responseObject = []
                if (vendedor){
                    sql = {user: id, vendedor: vendedor}
                }else{
                    sql = {user: id}
                }
                client.find(sql, (err, data) => {
                    const clients = data.map((data) => {
                        return {
                            name: data.nome,
                        }
                    })
                    if (clients == null || typeof projects == undefined) {
                        reject('Não foram encontrados clientes')
                    } else {
                        let listName = clients.filter(function (a){
                            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true)  
                        },Object.create(null));
                        // let listName = []
                        // clients.forEach((item) => {
                        //     var duplicated = listName.findIndex(redItem => {
                        //         return item.a == redItem.a
                        //     }) > -1

                        //     if (!duplicated) {
                        //         listName.push(item)
                        //     }
                        // })
                        resolve(listName)
                    }
                })
            })

            allClients.then((result) => {
                res.send(result)
            }).catch((err) => {
                console.log('Deu erro ' + err)
            })
        })
    }
}

module.exports = ListInput;

// let server = http.createServer(app);
// server.listen(3031);
// console.log('Servidor rodando na porta 3031')    