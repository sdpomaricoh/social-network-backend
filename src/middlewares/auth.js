'use strict';

/*
 * Import dependencies
 */
const jwt = require('jwt-simple');
const moment = require('moment');

const isAuth = (req, res, next) => {

  if (!req.headers.authorization)
    return res.status(403).send({
      success: false,
      message: 'No have access'
    });

  const token = req.headers.authorization.replace(/['"]+/g, '');

  let payload;

	try {

    payload = jwt.decode(token, process.env.SECRET);

    if (payload.exp <= moment.unix())
      res.status(401).send({
        success: false,
        message: 'the token has expired'
      });

	} catch (e) {
	    res.status(404).send({
			  success: false,
	      message: 'Invalid token'
	    })
	}

  req.user = payload.sub;

	next();
}

module.exports = isAuth;
