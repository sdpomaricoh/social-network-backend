/*
 * Import dependencies
 */
const fs = require('fs');


/**
 * [validate if a value if diferent to undefined, empty and null]
 * @param  {string} value
 * @param  {Object} res
 * @return {boolean}
 */
const validVariable = (value) => {
  if(value === undefined || value === null || value === "") return false;
  return true;
}

/**
 * [Remove a file]
 * @param  {string} message
 * @param  {Object} res
 * @param  {string} path
 * @return {json} [result to delete a file]
 */
const removeFiles = (res, path, message) => {
  fs.unlink(path, (err)=>{
    if(err) return res.status(500).send({success: false, message: err});
    return res.status(200).send({success: false, message: message});
  })
}

/**
 * Exports dependencies
 */
module.exports = {
  validVariable,
  removeFiles
}
