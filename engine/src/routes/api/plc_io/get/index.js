const readJson = require('@tool/json').read
const { readOne } = require('@tool/json')
const { data: store, accDir, live } = require('@store/index')

// Ответ микросервису rw: рама модулей и оборудования
function get() {
	return async function (req, res) {
		const acc = await readOne('acc.json', accDir)
		const [module, equipment] = await readJson(['module', 'equipment'])

		const alarm = !Object.keys(store.alarm.module).length
			? (acc?.module ?? {})
			: store.alarm.module
		// Пинг
		live()
		console.log('🟢 Рама модулей отправлена')
		res.status(200).json({ module, equipment, alarm })
	}
}

module.exports = get
