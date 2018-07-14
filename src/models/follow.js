'use strict';

/*
 * Import dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

/**
 * [clientSchema client model]
 * @type {Schema}
 */
const followSchema = new Schema ({
  user: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  followed: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  create_at: {
    type : Date,
    default: Date.now()
  },
});


/**
 * Paginate
 */
followSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Follow', followSchema)
