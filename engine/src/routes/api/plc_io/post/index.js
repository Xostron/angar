const { data: store } = require('@store')

function post() {
	return function (req, res) {
		// Сохраняем в аккумулятор опроса модулей
		store.v = req.body
		res.status(200).json({ result: true })
	}
}

module.exports = post
