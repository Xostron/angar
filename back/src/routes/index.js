const path = require('path')
var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
	const r = {
		code:'Angar API',
		config: path.join(process.env.PATH_DATA),
		retain: path.join(process.env.PATH_RETAIN),
		factory: path.join(process.env.PATH_FACTORY),
		uri:path.join(process.env.API_URI),
		ip:path.join(process.env.IP),
		version:path.join(process.env.VERSION)		
	}
	res.render('index', r);
});

module.exports = router;
