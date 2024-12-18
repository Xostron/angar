function on() {
	return function (req, res, next) {
		console.log('STATE: ping')
		res.json({ result: 'ping ok' })

	}
}

module.exports = on
