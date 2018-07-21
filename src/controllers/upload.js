'use strict';

/*
 * Import dependencies
 */
const User = require('../models/user');
const Publication = require('../models/publication');
const Helpers = require('../libs/helper');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const appRoot = require('app-root-path');
const uploadController = {};

/**
 * [upload a user profile picture]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result upload a image]
 */
uploadController.profile = (req, res) => {

  const userId = req.params.id;

  if (!req.file)
    return res.status(200).send({success: false, message: 'No image to attach'});

  const filePath = req.file.path;
  const fileName = req.file.filename
  const fileTypeArray = fileName.split('\.');
  const fileExt = fileTypeArray[1];
  const imageType = ['png','jpg','gif','bmp','jpeg'];
  const uploadUserDirectory = path.resolve( __dirname, `${appRoot}/uploads/users`);


  if(userId !== req.user)
    Helpers.removeFiles(res, filePath, 'You do not have authorization to modify the data', 200);

  if(imageType.indexOf(fileExt) === -1)
    Helpers.removeFiles(res, filePath, 'Invalid file format', 200);

  const optimizeName =  fileName.replace('original-', '');

  sharp(uploadUserDirectory + '/' + fileName)
    .jpeg({quality:50}).webp({quality:50}).png({quality:50})
    .resize(512, 512).crop(sharp.strategy.entropy)
    .toFile(uploadUserDirectory + '/' + optimizeName, (err, info) =>{
      if(err)
        return res.status(200).send({success: false, message: err});

        fs.unlink(filePath, (err)=>{
          if(err) return res.status(500).send({success: false, message: err});

          User.findByIdAndUpdate(userId, {image: optimizeName}, {new: true}, (err, userUpdated)=>{

            if (err)
              return res.status(500).send({ success: false, message: err });

            if (!userUpdated)
              return res.status(404).send({success: false, message: 'User not found'});

            res.status(200).send({success: true, user: userUpdated });

          });

        });

    });
}


/**
 * [upload a user profile picture]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result upload a image]
 */
uploadController.publication = (req, res) => {

  const userId = req.user;
  const publicationId = req.params.id

  if (!req.file)
    return res.status(200).send({success: false, message: 'No image to attach'});

  const filePath = req.file.path;
  const fileName = req.file.filename
  const fileTypeArray = fileName.split('\.');
  const fileExt = fileTypeArray[1];
  const imageType = ['png','jpg','gif','bmp','jpeg'];
  const uploadUserDirectory = path.resolve( __dirname, `${appRoot}/uploads/publications`);


  if(imageType.indexOf(fileExt) === -1)
    Helpers.removeFiles(res, filePath, 'Invalid file format', 200);

  Publication.findOne({_id: publicationId, user: userId}, (err, publication)=>{
    if (err)
      Helpers.removeFiles(res, filePath, err, 500);

    if (!publication)
      Helpers.removeFiles(res, filePath, 'Publication not found', 404);

    const optimizeName =  fileName.replace('original-', '');

    sharp(uploadUserDirectory + '/' + fileName)
    .jpeg({quality:50}).webp({quality:50}).png({quality:50})
    .toFile(uploadUserDirectory + '/' + optimizeName, (err, info) =>{
      if(err)
        Helpers.removeFiles(res, filePath, err, 500);

      fs.unlink(filePath, (err)=>{
        if(err) return res.status(500).send({success: false, message: err});

        publication.file = optimizeName;

        publication.save((err, publicationStored) => {

          if (err)
            return res.status(500).send({success: false, message: err});

          if (!publicationStored)
            return res.status(200).send({success: false, message: 'the post could not be updated'});

          res.status(200).send({
            success: true,
            publication: publicationStored
          });

        });

      });
    });

  });
}


module.exports = uploadController;
