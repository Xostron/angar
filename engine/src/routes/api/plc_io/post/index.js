const { data: store } = require('@store')
const { live } = require('@store/index')

function post() {
	return function (req, res) {
		live()
		// Сохраняем в аккумулятор опроса модулей
		store.v = req.body
		res.status(200).json({ result: true })
	}
}

module.exports = post
