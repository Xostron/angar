function ip() {
	return function (req, res, next) {
		res.json({ result: 'ip ok' })
	}
}

module.exports = ip
