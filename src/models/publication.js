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
const publicationSchema = new Schema ({
  user: {
    type: Schema.ObjectId,
		ref: 'User'
  },
  text: String,
  likes: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  file: String,
}, {timestamps: true});

/**
 * [update updatedAt middleware]
 */
publicationSchema.pre('update', function() {
  this.update({},{ $set: { updatedAt: new Date() } });
});

/**
 * Paginate
 */
publicationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Publication', publicationSchema)
