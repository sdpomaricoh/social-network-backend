'use strict';

/*
 * Import dependencies
 */
const Follow = require('../models/follow');
const Publication = require('../models/publication');
const Helpers = require('../libs/helper');


const publicationController = {}

/**
 * [create new publication]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of creating a new publication]
 */
publicationController.save = (req, res) =>{

  const params = req.body;

  if( !Helpers.validVariable(params.text) )
    return res.status(200).send({
      success: false,
      message: 'All data is required'
    });

  const publication = new Publication();

  publication.text = params.text;
  publication.user = req.user;
  publication.file = null;


  publication.save((err, publicationStored) => {

    if (err)
      return res.status(500).send({success: false, message: err});

    if (!publicationStored)
      return res.status(200).send({success: false, message: 'the post could not be created'});

    res.status(200).send({
      success: true,
      publication: publicationStored
    });

  });


}

/**
 * [list all publication on user timeline]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result of list timeline]
 */
publicationController.timeline = (req, res) =>{

  let page = null;
  const userId = req.user;

	if (req.params.page) page = req.params.page;
  else page = 1;

  const options = {
    sort: 'createdAt',
    limit: 10,
    page: page,
    populate: { path: 'user', select: '_id name lastname email username image'}
  }

  followUsersIds(userId)
    .then((follows)=>{
      Publication.paginate({user: {$in: follows}}, options, (err, result) => {
        if (err) return res.status(500).send({ success: false, messages: err});
        if (!result) return res.status(404).send({ success: false, message: 'no publications to show' });

        res.status(200).send({
          success: true,
          publications: result.docs,
          total: result.total,
          pages: result.pages
        });

      });
    }).catch((err)=>{
      return res.status(500).send({ success: false, messages: err});
    });;
}


/**
 * [find users ids of users followeds]
 * @param  {string} userId
 * @return {Array} [result of searching all the users ids followed]
 */
async function followUsersIds(userId){
  var followsIds = await Follow.find({user: userId}).distinct('followed');
  return followsIds;
}

/**
 * [view a single publication]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result find a single publication]
 */
publicationController.view = (req, res) =>{

  const publicationId = req.params.id;

  if( !Helpers.validVariable(publicationId))
    return res.status(200).send({
      success: false,
      message: 'must provide a publication id'
    });

  Publication.findById(publicationId, (err, publication) => {
    if (err)
      return res.status(500).send({success: false, message: err});
    if (!publication)
      return res.status(200).send({success: false, message: 'Publication not found'});
    res.status(200).send({success: true, publication: publication});
  });
}

/**
 * [delete a single publication]
 * @param  {Object} req [Request object]
 * @param  {Object} res [Response object]
 * @return {json}       [result delete a single publication]
 */
publicationController.delete = (req, res) =>{

  const publicationId = req.params.id;

  if( !Helpers.validVariable(publicationId))
    return res.status(200).send({
      success: false,
      message: 'must provide a publication id'
    });
  Publication.find({ _id: publicationId, user: req.user }).remove((err,)=>{
    if (err)
      return res.status(500).send({success: false, message: 'The publication could not be deleted'});
    res.status(200).send({success: true, publication: publicationDeleted});
  });
}

module.exports = publicationController;
