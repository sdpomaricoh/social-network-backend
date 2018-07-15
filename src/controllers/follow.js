'use strict';

/*
 * Import dependencies
 */
const Follow = require('../models/follow');
const User = require('../models/user');


const followController = {}

/**
 * [create a fallow]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of create a fallow]
 */
followController.follow = (req, res) =>{

  const userId =  req.user;
  const followedId = req.params.id;

  if(userId === followedId)
    return res.status(200).send({
      success: false,
      message: 'You can not follow yourself'
    });

  User.findById(followedId, (err, user) => {
    if (err)
      return res.status(500).send({success: false, message: err});
    if (!user)
      return res.status(200).send({success: false, message: 'User not found'});

    const follow = new Follow();
    follow.user = userId;
    follow.followed = user._id;

    follow.save((err, followStored) => {

      if (err)
        return res.status(500).send({success: false, message: err});

      if (!followStored)
        return res.status(200).send({success: false, message: 'The interaction could not be saved'});

      res.status(200).send({
        success: true,
        follow: followStored
      });

    });

  });
}

/**
 * [delete a fallow]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of delete a fallow]
 */
followController.unfollow = (req, res) =>{

  const userId =  req.user;
  const followedId = req.params.id;

  Follow.find({user: userId, followed: followedId}).remove((err)=>{
    if(err) return res.status(500).send({success: false, message: err});
    res.status(200).send({success: false, message: 'The following has been eliminated'})
  });

}

/**
 * [list of users followed]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [array of users]
 */
followController.followed = (req, res) =>{

  let userId =  req.user;
  if(req.params.id) userId = req.params.id;

  let page = null;
  if(req.params.page) page = req.params.page;


  if(page !== null){

    const options = {
      limit: 10,
      page: page,
      populate: {
        path: 'followed'
      }
    }

    Follow.paginate({ user: userId }, options, (err, result) =>{
      if (err) return res.status(500).send({ success: false, messages: err});
      if (!result) return res.status(404).send({ success: false, message: 'You do not follow any user' });
      res.status(200).send({
        success: true,
        followeds: result.docs,
        total: result.total,
        pages: result.pages
      })
    });

  } else {
    Follow.find({ user: userId }).populate({path: 'followed'}).exec((err, followeds)=>{
      if (err) return res.status(500).send({ success: false, messages: err});
      if (!followeds) return res.status(404).send({ success: false, message: 'You do not follow any user' });
      res.status(200).send({
        success: true,
        followeds: followeds,
        total: followeds.length,
        pages: 0
      })
    });
  }
}


/**
 * [list of followers]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [array of users]
 */
followController.followers = (req, res) =>{

  let userId =  req.user;
  if(req.params.id) userId = req.params.id;

  let page = null;
  if(req.params.page) page = req.params.page;

  const options = {
    limit: 10,
    page: page,
    populate: {
      path: 'user'
    }
  }

  if(page !== null){

    Follow.paginate({ followed: userId }, options, (err, result) =>{
      if (err) return res.status(500).send({ success: false, messages: err});
      if (!result) return res.status(404).send({ success: false, message: 'You do not follow any user' });
      res.status(200).send({
        success: true,
        followers: result.docs,
        total: result.total,
        pages: result.pages
      })
    });

  } else {

    Follow.find({ followed: userId }).populate({path: 'user'}).exec((err, followers) =>{
      if (err) return res.status(500).send({ success: false, messages: err});
      if (!followers) return res.status(404).send({ success: false, message: 'You do not follow any user' });
      res.status(200).send({
        success: true,
        followers: followers,
        total: followers.length,
        pages: 0
      })
    });
  }
}


module.exports = followController;
