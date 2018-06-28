'use strict';
/*
 * Import dependencies
 */
const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * Panel route
 */
router.get('/', express.static(path.resolve('public')));

module.exports = router
