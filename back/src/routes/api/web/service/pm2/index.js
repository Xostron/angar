function pm2() {
	return function (req, res, next) {
		res.json({ result: 'pm2 ok' })
	}
}

module.exports = pm2
