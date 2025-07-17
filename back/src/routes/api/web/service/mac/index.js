function mac() {
	return function (req, res, next) {
		res.json({ result: 'mac ok' })
	}
}

module.exports = mac
