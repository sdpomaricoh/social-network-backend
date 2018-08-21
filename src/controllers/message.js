'use strict';

/*
 * Import dependencies
 */
const Message = require('../models/message');
const User = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;


const messageController = {}

/**
 * [create a new message]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of create a new message]
 */
messageController.send = (req, res) => {

  const params = req.body;

  if (!params.receiver || !params.message)
    return res.status(200).send({
      success: false,
      message: 'you can not send the message without a receiver or without content'
    });

  const emmitter =  req.user, receiver = params.receiver, content = params.message;

  User.findById(receiver, (err, user) => {

    if (err)
      return res.status(500).send({success: false, message: err});
    if (!user)
      return res.status(200).send({success: false, message: 'User not found'});

    const message = new Message();
    message.receiver = receiver;
    message.emmitter = emmitter;
    message.message = content;

    message.save((err, messageStored) => {

      if (err)
        return res.status(500).send({success: false, message: err});

      if (!messageStored)
        return res.status(200).send({success: false, message: 'The message could not be saved'});

      res.status(200).send({
        success: true,
        message: messageStored
      });

    });

  });
};

/**
 * [get the received message]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of find the received message]
 */
messageController.received = (req, res) => {

  let page = null;
  const limit = 10;
  const userId = ObjectId(req.user);
  if (req.params.page) page = req.params.page;
  else page = 1;

  Message.aggregate(
    [
      {
        $match: { receiver: userId }
      },{
        $group : {
          _id : "$emmitter",
          messages: { $push: "$$ROOT" },
          count: {$sum: 1}
        }
      },{
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },{
        $limit: limit
      },{
        $skip: (page - 1) * limit
      }
    ], (err, messages) => {
      if (err) return res.status(500).send({ success: false, message: err});
      if (!messages) return res.status(200).send({ success: false, message: 'No messages to show'});
      res.send({
        success: true,
        messages: messages,
      });
    }
  );
};

/**
 * [get the sended messages]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of find the sended messages]
 */
messageController.sended = (req, res) => {

  let page = null;
  const limit = 10;
  const userId = ObjectId(req.user);
  if (req.params.page) page = req.params.page;
  else page = 1;

  Message.aggregate(
    [
      {
        $match: { emmitter: userId }
      },{
        $group : {
          _id : "$receiver",
          messages: { $push: "$$ROOT" },
          count: {$sum: 1}
        }
      },{
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },{
        $limit: limit
      },{
        $skip: (page - 1) * limit
      }
    ], (err, messages) => {
      if (err) return res.status(500).send({ success: false, message: err});
      if (!messages) return res.status(200).send({ success: false, message: 'No messages to show'});
      res.send({
        success: true,
        messages: messages,
      });
    }
  );

};

/**
 * [count the unviewed messages]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of count the unviewed messages]
 */
messageController.unviewed = (req, res) =>{
  const userId = req.user;

  Message.count({ receiver: userId , viewed: false}, (err, count)=>{
    if (err) return res.status(500).send({ success: false, message: err});
    res.send({
      success: true,
      unviewed: count
    });

  });
};

/**
 * [mark as read all the messages]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of mark as read the messages]
 */
messageController.readed = (req, res) =>{

  const userId = req.user;
  const update = { viewed: true };

  Message.update(
    { receiver: userId , viewed: false }, update , { 'multi': true }, (err, message)=>{
    if (err) return res.status(500).send({ success: false, message: err});
    res.send({
      success: true,
      unviewed: message
    });

  });
};

module.exports = messageController;
