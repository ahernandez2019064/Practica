'use strict'

var Empresa = require('../Modelos/empresa.modelo');
var Usuario = require('../Modelos/admin.modelo');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../Servicios/jwt');

function loginAdmin(req, res){
    var params = req.body;

    Usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'});

        if(usuarioEncontrado){
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada)=>{
                if(passVerificada){
                    if(params.getToken === 'true'){
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        })
                    }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({usuarioEncontrado})
                    }
                }else{
                    return res.status(500).send({mensaje: 'El usuario no se a podido verificar'});
                }
            });
        } else{
            return res.status(500).send({mensaje:'Error al buscar el usuario'});
        }
    })
}

function registrarEmpresas(req,res){
    if (req.user.rol === 'ROL_ADMIN'){
        var empresa = new Empresa();
        var params = req.body;
        if(params.nombreEmpresa && params.password && params.correoEmpresa){
            empresa.nombreEmpresa = params.nombreEmpresa;
            empresa.password = params.password;
            empresa.rol = 'ROL_EMPRESA';
            empresa.correoEmpresa = params.correoEmpresa;
            empresa.empleados = [];

            Empresa.find({nombreEmpresa: empresa.nombreEmpresa}).exec((err, empresaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion de empresa'})
                if(empresaEncontrada && empresaEncontrada.length >= 1){
                    return res.status(200).send({mensaje:'La empresa ya existe'})
                }else{
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada)=>{
                        empresa.password = passwordEncriptada;

                        empresa.save((err, empresaGuardada)=>{
                            if(err) return res.status(500).send({mensaje: 'Erros al guardar la empresa'})

                            if (empresaGuardada){
                                return res.status(200).send(empresaGuardada)
                            }else{
                                return res.status(404).send({ mensaje: 'No se ha podido registrar la Empresa'})
                            }
                        })
                    })
                }
            })
        }
    }else{
        return res.status(404).send({ mensaje: 'No tiene permiso para realizar esta acción'})
    }
    
}

function editarEmpresa(req, res) {
    if(req.user.rol === 'ROL_ADMIN'){
        var idEmpresa = req.params.id;
        var params = req.body;

        delete params.password;

        Empresa.findByIdAndUpdate(idEmpresa, params, { new: true}, (err, empresaActualizada)=>{
            if(err) return res.status(500).send({mensaje:'Error en la peticion'})
            if(!empresaActualizada) return res.status(500).send({mensaje:'No se a podido editar la empresa'})

            return res.status(200).send({ empresaActualizada });
        })
    }
}

function eliminarEmpresa(req, res) {
    if(req.user.rol === 'ROL_ADMIN'){
        var idEmpresa = req.params.idEliminar;  

        Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada)=>{
            if(err) return res.status(500).send({mensaje:'Error en la peticion de eliminar'})
            if(!empresaEliminada) return res.status(500).send({mensaje:'No se ha eliminado la empresa'});

            return res.status(200).send({mensaje:'La empresa ha sido eliminada'});
        })
    }else{
        return res.status(500).send({ mensaje: 'Usted no tiene los permisos para realizar esta acci' })
    }
}


module.exports = {
    loginAdmin,
    registrarEmpresas,
    editarEmpresa,
    eliminarEmpresa
}