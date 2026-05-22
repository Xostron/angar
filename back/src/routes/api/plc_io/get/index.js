const readJson = require('@tool/json').read

// Ответ микросервису rw: рама модулей и оборудования
function get() {
	return function (req, res) {
		readJson(['module', 'equipment']).then(([module, equipment]) => {
			res.status(200).json({ module, equipment })
		})
	}
}

module.exports = get
