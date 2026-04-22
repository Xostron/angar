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
				console.log('Ответ:', r)
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

	// Ждем 10 сек (предохранитель) или завершение текщего основного цикла программы
	while (cur === store.cycleId && repeat < 10) {
		const done = await delay(1000)
		repeat += done ? 1 : 0
		console.log(1, 'Ждем конца цикла', cur, store.cycleId, cur === store.cycleId, repeat)
	}

	// Дождались изменения:
	// по циклу программы -> возврат state и retain
	if (cur !== store.cycleId) {
		console.log(2, 'Подготовка ответа')
		// state ангара (карточки складов и т.д.)
		const { result = [], present = [] } = await prepare('init')
		// retain
		return {
			state: result,
			retain: obj?.buildingId ? store.retain[obj?.buildingId] : store.retain,
		}
	}

	// По предохранителю -> Ошибка сервера ангара
	console.log(2, 'Выход по таймауту')
	return null
}
