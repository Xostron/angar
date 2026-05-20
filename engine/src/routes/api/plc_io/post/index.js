const { data: store } = require('@store')

function post() {
	return function (req, res) {
		store.v = req.body
		console.log(123, store.v)
		res.status(200).json({ result: true })
	}
}

module.exports = post
