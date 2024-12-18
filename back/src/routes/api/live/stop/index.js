function on() {
	return function (req, res, next) {
		console.log('STATE: stop')
		res.json({ result: 'stop ok' })
	}
}

module.exports = on
