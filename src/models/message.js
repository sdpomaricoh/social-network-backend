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
const messageSchema = new Schema ({
  emmiter: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  receiver: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  text: String,
  create_at: {
    type : Date,
		default: Date.now()
  },
});


module.exports = mongoose.model('Message', messageSchema)
