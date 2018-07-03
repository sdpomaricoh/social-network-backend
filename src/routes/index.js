'use strict';

/*
 * Import dependencies
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const isAuth = require('../middlewares/auth');

/*
 * Import controllers
 */
const userController = require('../controllers/user');
const authController = require('../controllers/auth');

/**
 * Frontend routes
 */
router.get('/', express.static(path.resolve('public')));

/**
 * User routes
 */
router.post('/user/create', userController.save);


/**
 * Auth routes
 */
router.post('/login', authController.login);
router.post('/login/check', authController.check);

module.exports = router
