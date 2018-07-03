'use strict';
/*
 * Import dependencies
 */
const jwt = require('jwt-simple');
const moment = require('moment');

function createToken(user) {
	const payload = {
    sub: user._id,
    role: user.role,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
	};
	const token = jwt.encode(payload, process.env.SECRET);
	return token;
}

module.exports = createToken
