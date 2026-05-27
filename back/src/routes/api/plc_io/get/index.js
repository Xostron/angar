const { live } = require('@store/index')

const readJson = require('@tool/json').read

// Ответ микросервису rw: рама модулей и оборудования
function get() {
	return function (req, res) {
		live()
		readJson(['module', 'equipment']).then(([module, equipment]) => {
			res.status(200).json({ module, equipment })
		})
	}
}

module.exports = get
