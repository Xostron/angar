function get() {
	return function (req, res, next) {
		console.log('test get');
		res.json({ result: 'test ok' });
	};
}

module.exports = get;
