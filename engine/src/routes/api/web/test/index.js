const get = require('./get');

function test(router) {
	router.get('/test', get());
}

module.exports = test;
