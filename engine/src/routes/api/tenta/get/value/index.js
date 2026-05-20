const { data: store } = require('@store')

function value() {
	return function (req, res) {
		res.json(store.value)
	}
}

module.exports = value
