'use strict';

/*
 * Import dependencies
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

/**
 * config libraries
 */
const database = require('./src/libs/mongo');
const headers = require('./src/middlewares/headers');
const log = require('./src/libs/log');
const error = require('./src/middlewares/error');
const router = require('./src/routes');


/**
 * [initialize express framework]
 * @type {object}
 */
const app = express();

/**
 * [port of server]
 * @type {number}
 */
const port = process.env.PORT || 3000;

/**
 * Configure express dependencies
 */
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined', { stream: log.stream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/**
 * config headers to use rest method
 */
app.use(headers.config);

/**
 *import routes
 */
app.use('/', router);


/**
 * error 404 and 500 handler
 */
app.use(error._404);
app.use(error._500);


/**
 * [run the conenction of database an http server]
 * @type {Object} express intance
 * @type {Number} port of http server
 */
database.connect(app, port);

module.exports = app;
