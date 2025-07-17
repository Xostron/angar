function npm() {
	return function (req, res, next) {
		res.json({ result: 'npm ok' })
	}
}

module.exports = npm
