'use strict';

/*
 * Import dependencies
 */
const User = require('../models/user');
const createToken = require('../services/token');
const Helpers = require('../libs/helper');
const jwt = require('jwt-simple');
const moment = require('moment');

const authController = {}

/**
 * [login a user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of login of a user]
 */
authController.login = (req, res) => {

  const params = req.body;

  const email = params.email;
  const password = params.password;

  //Verify that all necessary data were received
  if(!Helpers.validVariable(email) && !Helpers.validVariable(password))
    return res.status(200).send({
      success: false,
      message: 'All data is required'
    });

  User.findOne({email: email}, (err, user) =>{

    if (err) return res.status(500).send({success: false, message: err});

    if(!user) return res.status(200).send({success: false, message: 'user not register'});

    User.getAuthenticated(email, password, (err, userLoggedin, reason) => {

      if (err) return res.status(500).send({success: false, message: err});

      if(userLoggedin)
        return res.status(200).send({
          success: true,
          user: userLoggedin,
          token: createToken(userLoggedin)
        });

      const reasons = User.failedLogin;

      switch (reason) {
        case reasons.NOT_FOUND:
          res.status(404).send({success: false, message: 'user not register'});
          break;
        case reasons.PASSWORD_INCORRECT:
          // note: these cases are usually treated the same - don't tell
          // the user *why* the login failed, only that it did
          res.status(200).send({success: false, message: 'error in the info provided'});
          break;
        case reasons.MAX_ATTEMPTS:
          // send email or otherwise notify user that account is
          // temporarily locked
          res.status(200).send({
            success: false,
            message: 'maximum attempts allowed to log in, that account is temporarily locked'
          });
          break;
      }

    });

  });
}

authController.check = (req, res) =>{

  const token = req.body.token;

  if(!Helpers.validVariable(token))
    return res.status(200).send({
      success: false,
      message: 'token is required'
    });

  let payload;

  try {

    payload = jwt.decode(token, process.env.SECRET);

    if (payload.exp <= moment.unix())
      return res.status(200).send({
        success: false,
        message: 'the token has expired'
      });

    User.findOne({ _id: payload.sub }, (err, user) => {

      if (err) return res.send({ success: false, message: err });

      if (!user) return res.send({ success: false, message: 'user not found' });

      res.send({success: true, user: user});

    });

  } catch (err) {

    res.status(500).send({
      success: false,
      message: 'Invalid Token'
    })
  }

}

module.exports = authController;
