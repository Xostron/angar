function on() {
	return function (req, res, next) {
		console.log('STATE: off')
		res.json({ result: 'off ok' })
	}
}

module.exports = on
