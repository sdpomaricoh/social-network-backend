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
const publicationSchema = new Schema ({
  user: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  text: String,
  file: String,
  email: String,
  create_at: {
    type : Date,
		default: Date.now()
  },
});


module.exports = mongoose.model('Publication', publicationSchema)
