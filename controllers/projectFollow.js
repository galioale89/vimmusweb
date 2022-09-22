const projectFollowService = require('../service/projectFollowService');

async function projectFollow(_idUser, _idPro, datePost, checkPost, dateSoli, checkSoli, dateApro, checkApro, dateChange, checkChange, insertObs, observation, checkPaied, checkPaiedRefresh, checkAuth, checkAuthRefresh) {

    var projeto = new projectFollowService(
        _idPro,
        datePost,
        dateSoli,
        dateApro,
        dateChange,
        observation,
        checkPaied,
        checkAuth
    );

    await projeto.setStatusProject('pago', checkPaiedRefresh);
    await projeto.setStatusProject('autorizado', checkAuthRefresh);
    await projeto.saveObservation('obsprojetista', insertObs, _idUser);
    await projeto.saveDate('dataPost', checkPost, 'postado');
    await projeto.saveDate('dataApro', checkApro, 'aprovada');
    await projeto.saveDate('dataSoli', checkSoli, 'solicitada');
    await projeto.saveDate('dataTroca', checkChange, 'trocado o medidor');

}

module.exports = projectFollow;