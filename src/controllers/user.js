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
  if( Helpers.validVariable(params.name) && Helpers.validVariable(params.lastname) &&
      Helpers.validVariable(params.username) && Helpers.validVariable(params.email) &&
      Helpers.validVariable(params.password))
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
	const itemsPerPage = 10;

	User.find().sort('createdAt').paginate(page, itemsPerPage, (err, users, total) => {
		if (err) return res.send({ success: false, messages: err});
		if (!users) return res.send({ success: false, message: 'No users to show'});
		res.send({
      success: true,
      users: users,
      total: total,
      pages: Math.ceil(total/itemsPerPage)
    });
	});
};


/**
 * [view a single user]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result find a single user]
 */
userController.view = (req, res) => {

  const userId = req.params.id, user = new User();

  User.findById(userId, (err, user) => {
    if (err)
      res.send({success: false, message: err});
    if (!user)
      return res.send({success: false, message: 'User not found'});
    res.send({success: true, user: user});
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

  if(Helpers.validVariable(update.current_password) && Helpers.validVariable(update.new_password)){

    User.findById(userId, (err, user) => {

      if (err)
        return res.status(500).send({success: false, message: err});
      if (!user)
        return res.status(404).send({success: false, message: 'User not found'});

      user.verifyPassword(update.current_password, (err, check) => {

        if (err)
          return res.send({ success: false, message: err});

        if (!check)
          return res.send({ success: false, message: 'invalid password'});

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

module.exports = userController;
