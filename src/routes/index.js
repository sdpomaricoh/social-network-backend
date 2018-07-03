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
router.get('/user/all/:page?',isAuth, userController.all);
router.get('/user/:id', isAuth, userController.view);
router.put('/user/update/:id', isAuth, userController.update);

/**
 * Auth routes
 */
router.post('/login', authController.login);
router.post('/login/check', authController.check);

module.exports = router
