const { store } = require('@store')
const make = require('../make')
const fnCacheDO = require('./fn/cache')
const Aboc = require('@tool/abort_controller')
const { timeout } = require('@tool/module/timeout')
const { delay } = require('@tool/time')

/**
 * Чтение модулей
 * @param {*} arr Массив модулей
 * @returns {Promise<object>} Объект: ключ-id модуля, значение-массив показаний модуля
 */
async function read(arr) {
	try {
		const data = {}
		for (let i = 0; i < arr.length; i++) {
			if (Aboc.check()) return
			// ИД модуля: массив ИД string[] - дублеры от разных складов
			const idsM = arr[i]._id
			const idsB = arr[i].buildingId

			// Разрешение на чтение
			if (!timeout(idsB, idsM, arr[i].ip, arr[i])) continue

			// Чтение
			let v = await make(arr[i])

			// Кэш для модулей DO
			v = fnCacheDO(v, arr[i])
			// флаг первого запуска сервера
			store._startup = false

			// Пауза перед опросом следующего модуля (без этой паузы модули читаются не стабильно)
			await delay(store.tPause)

			// Ошибка модуля (ответ от модуля не массив чисел) => модуль не прочитан - пропускаем итерацию
			if (!(v instanceof Array)) {
				set(idsM, v, data)
				data.error = idsB
				continue
			}

			// Модуль прочитан без ошибок
			switch (arr[i].use) {
				case 'r':
				case 'w':
					set(idsM, v[0], data)
					break
				case 'rw':
					setRW(idsM, v, data)
					break
				default:
					break
			}
		}
		return data
	} catch (error) {
		console.error('ERROR', error)
	}
}

function set(idsM, v, data) {
	idsM.forEach((idM) => (data[idM] = v))
}

function setRW(idsM, v, data) {
	idsM.forEach((idM) => {
		data[idM] ??= {}
		data[idM].input = v[0]
		data[idM].output = v[1]
	})
}

module.exports = read
