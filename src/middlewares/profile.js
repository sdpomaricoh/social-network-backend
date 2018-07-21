'use strict';

/*
 * Import dependencies
 */
var multer  = require('multer');
const appRoot = require('app-root-path');
const path = require('path');
const crypto = require('crypto');

/*
 * Config multer
 */
const uploadUserDirectory = path.resolve( __dirname, `${appRoot}/uploads/users`);

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadUserDirectory)
  },
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      if (err) return callback(err);
      callback(null, 'original-' + raw.toString('hex') + path.extname(file.originalname));
    });
  }
})

const upload = multer({storage: storage});

module.exports = upload;
