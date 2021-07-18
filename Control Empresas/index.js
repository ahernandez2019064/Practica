'use strict'

const mongoose = require('mongoose');
const app = require('./app');
var Usuarios = require('./src/Modelos/admin.modelo');
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/ControlEmp', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    var nombre = 'Admin';
    var Contraseña = '123456';
    var rol = 'ROL_ADMIN';
    var usuario = new Usuarios();

    usuario.nombre = nombre
    usuario.password = Contraseña
    usuario.rol = rol

    Usuarios.find({nombreUsuario: usuario.usuario}).exec((err, usuarioEncontrado) =>{
        if(usuarioEncontrado && usuarioEncontrado.length >= 1){
            console.log('El usuario ya existe');
        }else{
            bcrypt.hash(usuario.password, null, null, (err, passEncriptada)=>{
                usuario.password = passEncriptada;
                usuario.save((err, usuarioGuardado)=>{
                    if(err)console.log('Error en la peticion de Guardar');

                    if(usuarioGuardado){
                        console.log({ usuarioGuardado });
                    }else{
                        console.log('No se ha podido registrar al usuario');
                    }
                })
            })
        }
    })
    

    app.listen(3000, function(){
        console.log('Servidor corriendo en el puerto 3000');
    })

}).catch(err => console.log(err))

