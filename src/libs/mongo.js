/*
 * Import dependencies
 */
const mongo = require('mongoose');

const database = {};

database.connect = (app, port) => {
  mongo.Promise = global.Promise;
  mongo.connect('mongodb://localhost:27017/social_network')
    .then(()=>{
      console.log('database connection success');
      app.listen(port, () => {
        console.log(`app running on port ${port}`);
      });
    })
    .catch((err)=>{
      console.log(err);
    });
};

module.exports = database;
