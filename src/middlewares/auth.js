/*
 * Import dependencies
 */
const jwt = require('jwt-simple');
const moment = require('moment');

function isAuth(req, res, next) {

	if (!req.headers.authorization) return res.send({
		success: false,
	  message: 'No have access'
	});

	const token = req.headers.authorization.replace(/['"]+/g, '');
	const payload = jwt.decode(token, process.env.SECRET);

	try {

    if (payload.exp <= moment.unix())
      res.send({
        success: false,
        message: 'the token has expired'
      });

	} catch (e) {
	    res.send({
			  success: false,
	      message: 'Invalid token'
	    })
	}

	req.role = payload.role;

	next();
}

module.exports = isAuth;
