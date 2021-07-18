'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'Ctrl_Empresas';

exports.createToken = function (todos){
    var payload = {
        sub: todos._id,
        nombreEmpresa: todos.nombre,
        password: todos.password,
        rol: todos.rol,
        iat: moment().unix(),
        exp: moment().day(10, 'days').unix()
    }

    return jwt.encode(payload, secret);
}

/*exports.createTokenAdmin = function (usuario){
    var payload = {
        sub: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        password: usuario.password,
        rol: usuario.rol,
        iat: moment().unix(),
        exp: moment().day(10, 'days').unix()
    }

    return jwt.encode(payload, secret);
}*/