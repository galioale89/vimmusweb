var diferencaDias = function (dtini, dtfim) {
    console.log('entrou')
    var diavalini
    var mesvalini
    var anovalini
    var diavalfim
    var mesvalfim
    var anovalfim
    var data2
    var data1
    var dif
    var days

    diavalini = dtini.substring(8, 11)
    mesvalini = dtini.substring(5, 7) - 1
    anovalini = dtini.substring(0, 4)
    diavalfim = dtfim.substring(8, 11)
    mesvalfim = dtfim.substring(5, 7) - 1
    anovalfim = dtfim.substring(0, 4)

    data1 = new Date(anovalini, mesvalini, diavalini)
    data2 = new Date(anovalfim, mesvalfim, diavalfim)

    console.log('data1=>'+data1)
    console.log('data2=>'+data2)

    dif = Math.abs(data2.getTime() - data1.getTime())
    days = Math.ceil(dif / (1000 * 60 * 60 * 24))
    console.log('days=>'+days)
    if (days == 0){
        return 1
    }else{
        return days
    }  
}

module.exports = diferencaDias
