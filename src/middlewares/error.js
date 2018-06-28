const error = {};

error._404 = (req, res, next) => {
  res.status(404);
  log.info('%s %d %s', req.method, res.statusCode, req.url);
  res.json({
    success: false,
    message: 'Not found'
  });
  return;
};

error._500 = (req, res, next) => {
  res.status(err.status || 500);
	log.error('%s %d %s', req.method, res.statusCode, err.message);
	res.json({
		success: false,
		message: err.message
	});
	return;
}

module.exports = error;
