'use strict'

var Empresa = require('../Modelos/empresa.modelo');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../Servicios/jwt');
const { db } = require('../Modelos/empresa.modelo');
const pdf = require("pdfkit");
const fs  = require("fs");
var datos;

function pdfEmpleados(req, res) {
    var params = req.body;

    if (req.user.rol === "ROL_ADMIN") return res.status(500).send({mensaje:"solo las empresas pueden generar PDF"});

    if(params.nombreEmpresa === req.user.nombreEmpresa){
        var idEmpresa = req.params.idPdf;

        Empresa.find({_id: idEmpresa } ,{"empleados":1},(err, empleadosEncontrados)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de empleados'});
            if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener de empleados' });


           datos = empleadosEncontrados;
            var doc = new pdf();
            doc.pipe(fs.createWriteStream(`./src/pdf/empleados  ${req.user.nombre}.pdf`));

            doc.text(`Nuestros empleados son:`,{
                align: 'center',
            })

            doc.text(datos,{
                align: 'left'
            });

            doc.end();
            return res.status(200).send({mensaje: "PDF generado"});
        })

    }
}

function login(req, res){
    var params = req.body;

    Empresa.findOne({ nombre: params.nombreEmpresa }, (err, empresaEncontrada)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'});

        if(empresaEncontrada){
            bcrypt.compare(params.password, empresaEncontrada.password, (err, passVerificada)=>{
                if(passVerificada){
                    if(params.getToken === 'true'){
                        return res.status(200).send({
                            token: jwt.createToken(empresaEncontrada)
                        })
                    }else{
                        empresaEncontrada.password = undefined;
                        return res.status(200).send({empresaEncontrada})
                    }
                }else{
                    return res.status(500).send({mensaje: 'La empresa no se a podido verificar'});
                }
            });
        } else{
            return res.status(500).send({mensaje:'Error al buscar la empresa'});
        }
    })
}

function editarEmpresa(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;

    delete params.password;

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para editar esa empresa'});
    }

    Empresa.findByIdAndUpdate(idEmpresa, params, { new: true}, (err, empresaActualizada)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!empresaActualizada) return res.status(500).send({mensaje:'No se a podido editar la empresa'})

        return res.status(200).send({ empresaActualizada });
    })
}

function eliminarEmpresa(req, res) {
    var idEmpresa = req.params.idEliminar;

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada)=>{
        if(err) return res.status(500).send({mendaje:'Error en la peticion de eliminar'})
        if(!empresaEliminada) return res.status(500).send({mensaje:'No se ha eliminado la empresa'});

        return res.status(200).send({mensaje:'La empresa ha sido eliminada'});
        })
    
}

function agregarEmpleados(req, res) {
    var idEmpresa = req.params.idEmpleado;
    var params = req.body

    delete params.password

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje: 'Usted no posee los permisos para realizar esta accion'});
    }
    
    Empresa.findByIdAndUpdate(idEmpresa,
        { $push: {
            empleados: {
                nombreEmpleado: params.nombreEmpleado,
                puesto: params.puesto,
                departamento: params.departamento,
                estado: params.estado
            }
        }}, {new: true}, (err, empleadoAgregado)=>{
            if(err) return res.status(500).send({mensaje:'Error en la peticion de agregar'});
            if(!empleadoAgregado) return res.status(500).send({ mensaje: 'No se ha podido agregar el Empleado' });

            return res.status(200).send({ empleadoAgregado })
        })
}

// Para completar el actualizarEmpleados, se deben de ingresar todos los datos
function actualizarEmpleados(req, res) {
    var idEmpresa = req.params.id;
    var idEmpleado = req.body._id ;
    var params = req.body;

    delete params.password;

    Empresa.findOneAndUpdate({
        _id: idEmpresa,
        "empleados._id": idEmpleado
    }, {
        "empleados.$.nombreEmpleado": params.nombreEmpleado,
        "empleados.$.puesto": params.puesto,
        "empleados.$.departamento": params.departamento,
        "empleados.$.activo": params.activo,
    }, {new: true},

    (err, empleadoActaulizado) => {

        err ?
            res.status(500).send({ message: 'Error en la peticion' }) 

            :null 
            !empleadoActaulizado ?
            res.status(500).send({ message: 'Error al guardar empleado' }) :
            null

        return res.status(200).send({ empleadoActaulizado })
    })

}

function eliminarEmpleados(req, res) {
    var idEmpresa = req.params.idElim;
    var idEmpleado = req.body._id ;

    Empresa.findOneAndUpdate({
        _id: idEmpresa,
        "empleados._id": idEmpleado
    },{
        $pull: {empleados: { _id: idEmpleado}}
    },
    (err, empleadoEliminado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!empleadoEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar el empleado' });

        return res.status(200).send({ mensaje: "Empleado eliminado" })
    })

}

// BUSQUEDAS

function listarEmpleados(req, res) {
    var idEmpresa = req.params.idListar;

    if (idEmpresa != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esa Empresa' });
    }

    Empresa.find({_id: idEmpresa } ,{"empleados":1},(err, empleadosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de empleados'});
        if(!empleadosEncontrados) return res.status(500).send({mensaje: 'Error al obtener de empleados' });

        return res.status(200).send({ empleadosEncontrados });
    })

}

function obtenerEmpleadoId(req, res) {
    var idEmpleado = req.params.idEmpleado;

    Empresa.findOne({ "empleados._id": idEmpleado }, { "empleados.$": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

function obtenerEmpleadoPuesto(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id;

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.find({ "empleados.$.puesto": params.puesto} , { "empleados": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });
    
        return res.status(200).send({ empleadoEncontrado });
    })
}

function obtenerEmpleadoDepartamento(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.findOne({ "empleados.departamento": params.departamento }, { "empleados.$": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ empleadoEncontrado });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

function obtenerEmpleadoNombre(req, res) {
    var params = req.body;
    var idEmpresa = req.params.id

    if(idEmpresa != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar esta empresa'});
    }

    Empresa.findOne({ "empleados.nombreEmpleado": params.nombreEmpleado }, { "empleados.$": 1, _id: 0} , (err, empleadoEncontrado)=>{
        if(err) return res.status(500).send({ empleadoEncontrado });
        if(!empleadoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Empleado' });

        return res.status(200).send({ empleadoEncontrado });
    })

}

module.exports = {
    login,
    editarEmpresa,
    eliminarEmpresa,
    agregarEmpleados,
    obtenerEmpleadoId,
    actualizarEmpleados,
    eliminarEmpleados,
    obtenerEmpleadoPuesto,
    obtenerEmpleadoDepartamento,
    pdfEmpleados,
    listarEmpleados,
    obtenerEmpleadoNombre

}