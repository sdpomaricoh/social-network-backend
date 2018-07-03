'use strict';

/*
 * Import dependencies
 */
const User = require('../models/user');
const Helpers = require('../libs/helper');

const userController = {}


/**
 * [create new user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of creating a new user]
 */
userController.save = (req, res) => {

  const params = req.body;
  const user = new User();

  //Verify that all necessary data were received
  if( !Helpers.validVariable(params.name) && !Helpers.validVariable(params.lastname) &&
      !Helpers.validVariable(params.username) && !Helpers.validVariable(params.email) &&
      !Helpers.validVariable(params.password))
    return res.status(200).send({
      success: false,
      message: 'All data is required'
    });

  //Prevent the registration of duplicate users
  User.find({
    $or: [
      {email: params.email.toLowerCase()},
      {username: params.username}
    ]
  }, (err, users) =>{

    if (err)
      return res.status(500).send({ success: false, message: err});

    if (users && users.length >= 1)
      return res.status(200).send({ success: false, message: 'The username o email is already taken registered' });

    user.name = params.name;
    user.lastname = params.lastname;
    user.username = params.username;
    user.email = params.email;
    user.password = params.password;
    user.role = 'user';
    user.image = 'default';
    if(params.bio) user.bio = params.bio;

    //Save the user data
    user.save((err, userStored) => {

      if (err){
        if(err.message)
          return res.status(500).send({success: false, message: err.message});
        return res.status(500).send({success: false, message: err});
      }

      res.status(200).send({
        success: true,
        user: userStored
      });

    });

  })

}

module.exports = userController;
