const { data: store } = require('@store')
const { readOne } = require('@tool/json')
const transform = require('./transform')

function pc() {
	return async function (req, res) {
		try {
			const p = [
				readOne('fan'), // Считываем данные вентиляторов
				readOne('section'), // Считываем данные секций
				readOne('building'), // Считываем данные складов
			]
			const [fan, section, building] = await Promise.all(p)
			const result = transform(store.value, building, section, fan)
			res.json(result)
		} catch (error) {
			console.log(error)
			res.status(400).json({ error: error.toString() })
		}
	}
}

module.exports = pc
