const { delay } = require('@tool/command/time')
const def = require('./def')
const prepare = require('@tool/state/back')
const { data: store } = require('@store')

// Запись данных (воркирование/таскирование): настройки, команды управления
function write() {
	return function (req, res) {
		const code = req.params.code
		const obj = req.body
		if (!def[code])
			return res.status(400).json({ error: `Операция отклонена. Неизвестный код ${code}` })
		// Выполнение команды
		def[code](obj)
			.then((_) => feedback(obj))
			.then((r) => {
				console.log('Команда от Мобилки выполнена')
				console.log('Ответ:', JSON.stringify(r ?? {}, null, '  '))
				res.status(200).json(r)
			})
			.catch((error) => {
				console.log('error', error)
				res.status(400).json({ error })
			})
	}
}

module.exports = write

/**
 * Ответ админке на команды управления/сохранение настроек
 *
 * @returns {object} {state, value}
 */
async function feedback(obj) {
	const cur = store.cycleId
	let repeat = 0

	// Ждем завершение текщего основного цикла программы
	while (cur + 1 >= store.cycleId) {
		// Ждем 1 сек
		const done = await delay(1000)
		repeat += done ? 1 : 0
		// Предохранитель: если за 10 сек цикл программы не изменился, то выход
		if (repeat > 10) {
			console.log(2, 'Выход по таймауту')
			return null
		}
		// console.log(1, 'Ждем конца цикла', cur, store.cycleId, cur === store.cycleId, repeat)
	}

	console.log(2, 'Подготовка ответа', cur, store.cycleId)
	// Дождались изменения: state ангара (карточки складов и т.д.), retain склада
	const { result = [], present = [] } = await prepare('init')
	return {
		state: result,
		retain: obj?.buildingId ? store.retain[obj?.buildingId] : store.retain,
	}
}
