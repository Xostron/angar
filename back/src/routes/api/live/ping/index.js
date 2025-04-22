function ping() {
	return function (req, res, next) {
		console.log('STATE: ping')
		res.send({ result: 'ping ok' })

	}
}

module.exports = ping
