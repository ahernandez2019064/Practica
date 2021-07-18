'use strict'

var express = require('express');
var adminController = require('../Controladores/admin.controlador');

var md_autorizacion = require('../middlewares/autherization');

var app = express.Router();

app.post('/loginAdmin', adminController.loginAdmin);
app.post('/registrarEmpresa', md_autorizacion.ensureAuth, adminController.registrarEmpresas);
app.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, adminController.editarEmpresa);
app.delete('/eliminarEmpresa/:idEliminar', md_autorizacion.ensureAuth, adminController.eliminarEmpresa);

module.exports = app;
