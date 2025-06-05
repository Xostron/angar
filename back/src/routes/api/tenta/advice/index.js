const { data: store } = require('@store')

function advice() {
	return function (req, res) {
		res.json(store.value)
	}
}

module.exports = advice