function on() {
	return function (req, res, next) {
		console.log('STATE: on')
		res.json({ result: 'on ok' })
	}
}

module.exports = on
