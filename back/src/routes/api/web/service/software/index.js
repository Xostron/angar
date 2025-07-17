function software() {
	return function (req, res, next) {
		res.json({ result: 'software ok' })
	}
}

module.exports = software
