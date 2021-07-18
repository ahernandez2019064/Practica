'use strict'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Importancion de rutas
var admin_route = require('./src/Rutas/admin.rutas');
var empresa_route = require('./src/Rutas/empresas.rutas');

//MIDDKEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Aplicacion de las rutas
app.use('/api', admin_route, empresa_route);

//Exportar
module.exports = app;

