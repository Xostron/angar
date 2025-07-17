function equipment() {
	return function (req, res, next) {
		console.log(99001)
		res.json({ result: 'equipment ok' })
	}
}

module.exports = equipment
