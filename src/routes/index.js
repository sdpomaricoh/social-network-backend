'use strict';

/*
 * Import dependencies
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const isAuth = require('../middlewares/auth');
const profile = require('../middlewares/profile');
const publication = require('../middlewares/publication');

/*
 * Import controllers
 */
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const uploadsController = require('../controllers/upload');
const followController = require('../controllers/follow');
const publicationController = require('../controllers/publication');

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
router.get('/user/count/:id', isAuth, userController.counter);
router.post('/user/upload/:id', [isAuth, profile.single('profile')], uploadsController.profile);
router.get('/user/profile/:id', isAuth, userController.profile);


/**
 * Follow routes
 */
router.post('/folow/:id', isAuth, followController.follow);
router.delete('/unfollow/:id', isAuth, followController.unfollow);
router.get('/followed/:id?/:page?', isAuth, followController.followed);
router.get('/followers/:id?/:page?', isAuth, followController.followers);


/**
 * Publications routes
 */
router.post('/publication/create', isAuth, publicationController.save);
router.get('/publication/timeline/:page?', isAuth, publicationController.timeline);
router.get('/publication/:id', isAuth, publicationController.view);
router.delete('/publication/:id', isAuth, publicationController.delete);
router.post('/publication/upload/:id', [isAuth, publication.single('file')], uploadsController.publication);

/**
 * Auth routes
 */
router.post('/login', authController.login);
router.post('/login/check', authController.check);

module.exports = router
