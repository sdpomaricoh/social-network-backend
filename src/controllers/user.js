'use strict';

/*
 * Import dependencies
 */
const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');
const Helpers = require('../libs/helper');
const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');

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


/**
 * [list of all users]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [array of user]
 */
userController.all = (req, res) => {

  let page = null;
  const userId = req.user;

	if (req.params.page) page = req.params.page;
  else page = 1;

  const options = {
    sort: 'createdAt',
    limit: 10,
    page: page
  }

	User.paginate({}, options, (err, result) => {
		if (err) return res.status(500).send({ success: false, messages: err});
    if (!result) return res.status(200).send({ success: false, message: 'No users to show'});
      followUsersIds(userId).then((follows)=>{
        res.send({
          success: true,
          users: result.docs,
          total: result.total,
          follows: follows,
          pages: result.pages
        });
      }).catch((err)=>{
        return res.status(500).send({ success: false, messages: err});
      });
	});
};

/**
 * [find users ids of users followeds]
 * @param  {string} userId
 * @return {Array} [result of searching all the users ids followed]
 */
async function followUsersIds(userId){
  var isfollow = await Follow.find({user: userId}).distinct('followed');
  return isfollow;
}


/**
 * [view a single user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result find a single user]
 */
userController.view = (req, res) => {

  const userId = req.params.id;

  if( !Helpers.validVariable(userId))
    return res.status(200).send({
      success: false,
      message: 'must provide a user id'
    });

  User.findById(userId, (err, user) => {
    if (err)
      return res.status(500).send({success: false, message: err});
    if (!user)
      return res.status(200).send({success: false, message: 'User not found'});

    Follow.findOne({user: req.user, followed: userId}, (err, follow)=>{
      if (err)
        return res.status(500).send({success: false, message: err});
      if (!follow)
        return res.status(200).send({success: true, user: user, follow: false});
      res.status(200).send({success: true, user: user, follow: true});
    });
  });
};



/**
 * [update a single user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of update a single user]
 */
userController.update = (req, res) => {

  const userId = req.params.id, update = req.body;

  if(update.password) delete update.password;

  if(userId !== req.user)
    return res.status(403).send({
      success: false,
      message: 'You do not have authorization to modify the data'
    })

  if(!Helpers.validVariable(update.current_password) && !Helpers.validVariable(update.new_password)){

    User.findById(userId, (err, user) => {

      if (err)
        return res.status(500).send({success: false, message: err});
      if (!user)
        return res.status(404).send({success: false, message: 'User not found'});

      user.verifyPassword(update.current_password, (err, check) => {

        if (err)
          return res.status(500).send({ success: false, message: err});

        if (!check)
          return res.status(200).send({ success: false, message: 'invalid password'});

        User.encryptPassword(update.new_password, (err, hash) => {

          if (err) return res.status(500).send({ success: false, message: err});

          delete update.new_password;
          delete update.current_password;
          update.password = hash;

          User.findOneAndUpdate({_id: userId}, update, {new: true}, (err, userUpdated)=>{

            if (err)
              return res.status(500).send({ success: false, message: err });

            if (!userUpdated)
              return res.status(404).send({success: false, message: 'User not found'});

            res.status(200).send({success: true, user: userUpdated });

          });

        });

      });

    });

  }else{

    User.findOneAndUpdate({_id: userId}, update, {new: true}, (err, userUpdated)=>{

      if (err)
        return res.status(500).send({ success: false, message: err });

      if (!userUpdated)
        return res.status(404).send({success: false, message: 'User not found'});

      res.status(200).send({success: true, user: userUpdated });

    });
  }

}

/**
 * [get a user profile picture]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {file}       [result find a image]
 */
userController.profile = (req, res) => {

  const userId = req.params.id;
  const upload = path.resolve( __dirname, `${appRoot}/uploads/users`);

  User.findById(userId, (err, user) => {

    if (err)
      res.status(500).send({success: false, message: err});
    if (!user)
      return res.status(200).send({success: false, message: 'User not found'});

    if( !Helpers.validVariable(user.image))
      return res.status(200).send({
        success: false,
        message: 'the user does not have a profile picture'
      });

    const imgPath = upload+'/'+user.image;

    fs.exists(imgPath, (exists)=> {

      if(!exists)
        return res.status(200).send({success: true, message: 'image not found'});

        res.sendFile(path.resolve(imgPath));
    })

  });
}

/**
 * [count the users followed and the followers of a user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {Array} [result of count the followed and the followers]
 */
userController.counter = (req, res) => {
  let userId = req.user;
  if(req.params.id) userId = req.params.id;

  counterFollows(userId).then((result)=>{
    res.status(200).send({
      success: false,
      followeds: result.countFalloweds,
      fallowers: result.countFallowers,
      publications: result.countPublications
    });
  }).catch((err)=>{
    res.status(500).send({success: false, message: err});
  });

}

/**
 * [find users ids of users followeds]
 * @param  {string} userId
 * @return {Array} [result of searching all the users ids followed]
 */
async function counterFollows(userId){
  const countFalloweds = await Follow.count({user: userId});
  const countFallowers = await Follow.count({followed: userId});
  const countPublications = await Publication.count({user: userId})

  return {countFalloweds, countFallowers, countPublications};
}

module.exports = userController;
