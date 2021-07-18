'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    nombreEmpresa: String,
    correoEmpresa: String,
    password: String,
    rol: String,
    empleados: [{ 
        nombreEmpleado: String,
        puesto: String,
        departamento: String,
        estado: Boolean
    }]
    
});

module.exports = mongoose.model('empresas', EmpresaSchema);