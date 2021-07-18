'use strict'

var express = require('express');
var empresaController = require('../Controladores/empresa.controlador');

var md_autorizacion = require('../middlewares/autherization');

var app = express.Router()

app.post('/loginEmp', empresaController.login);
app.put('/editarEmp/:id', md_autorizacion.ensureAuth, empresaController.editarEmpresa);
app.delete('/eliminarEmpresa/:idEliminar', md_autorizacion.ensureAuth, empresaController.eliminarEmpresa);
app.put('/agregarEmpleado/:idEmpleado', md_autorizacion.ensureAuth, empresaController.agregarEmpleados);
app.put('/editarEmpleado/:id', md_autorizacion.ensureAuth, empresaController.actualizarEmpleados);
app.put('/eliminarEmpleado/:idElim', md_autorizacion.ensureAuth, empresaController.eliminarEmpleados);

// Busquedas 
app.get('/buscarxId/:idEmpleado', md_autorizacion.ensureAuth, empresaController.obtenerEmpleadoId);
app.get('/buscarxPuesto/:id', md_autorizacion.ensureAuth, empresaController.obtenerEmpleadoPuesto);  
app.get('/buscarxDepartamento/:id', md_autorizacion.ensureAuth, empresaController.obtenerEmpleadoDepartamento);  
app.get('/listarEmpleados/:idListar', md_autorizacion.ensureAuth, empresaController.listarEmpleados);
app.get('/buscarxNombre/:id', md_autorizacion.ensureAuth, empresaController.obtenerEmpleadoNombre);

// PDF
app.get('/obtenerPDF/:idPdf', md_autorizacion.ensureAuth, empresaController.pdfEmpleados);


module.exports = app;