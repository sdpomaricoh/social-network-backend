'use strict';

/*
 * Import dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * [clientSchema client model]
 * @type {Schema}
 */
const userSchema = new Schema ({
  name: String,
  surname: String,
  nick: String,
  email: String,
  password: String,
  role: String,
  image: String
});


module.exports = mongoose.model('User', userSchema)
