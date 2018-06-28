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
const followSchema = new Schema ({
  user: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  fallower: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  create_at: {
    type : Date,
    default: Date.now()
  },
});


module.exports = mongoose.model('Follow', followSchema)
