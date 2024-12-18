function on() {
	return function (req, res, next) {
		console.log('STATE: battery')
		res.json({ result: 'battery ok' })
	}
}

module.exports = on
