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
const commentSchema = new Schema ({
  user: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  publication: {
    type: Schema.ObjectId,
    ref: 'Publication'
  },
  comment: String
}, {timestamps: true} );

/**
 * [update updatedAt middleware]
 */
commentSchema.pre('update', function() {
  this.update({},{ $set: { updatedAt: new Date() } });
});

/**
 * Paginate
 */
commentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Comment', commentSchema)
