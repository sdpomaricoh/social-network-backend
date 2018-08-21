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
const messageSchema = new Schema ({
  emmitter: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  receiver: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  message: String,
  viewed: {
    type: Boolean,
    default: false
  },
},{timestamps: true});

/**
 * [update updatedAt middleware]
 */
messageSchema.pre('update', function() {
  this.update({},{ $set: { updatedAt: new Date() } });
});

/**
 * Paginate
 */
messageSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Message', messageSchema)
