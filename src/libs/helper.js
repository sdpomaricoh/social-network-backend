
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
 * Exports dependencies
 */
module.exports = {
  validVariable
}
