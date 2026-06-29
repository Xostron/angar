const { store } = require('@store/index')
const make = require('../make')
const fnCacheDO = require('./fn/cache')
const Aboc = require('@tool/abort_controller')
const { timeout } = require('@tool/module/timeout')
const { delay } = require('@tool/time')

/**
 * Чтение модулей
 * @param {*} arr Массив модулей
 * @returns {Promise<object>} result = {v: {idM1:[1,1,1,1], idM1:[1,1,1,1],...},
 * cacheDO:{idM:[1,1,1,1], ...}
 * alarmMdl:{idB:{idM1:{...mes},idM:{...mes}}},
 * debMdl:{idB:{idM1:{...mes},idM:{...mes}}} }
 */
async function read(arr) {
	try {
		const result = { v: {}, cacheDO: {}, alarmMdl: {}, debMdl: {} }

		if (!arr?.length) return result

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
				set(idsM, v, result)
				// result.error = idsB
				continue
			}

			// Модуль прочитан без ошибок
			switch (arr[i].use) {
				case 'r':
				case 'w':
					set(idsM, v[0], result)
					break
				case 'rw':
					setRW(idsM, v, result)
					break
				default:
					break
			}
		}
		return result
	} catch (error) {
		console.error('ERROR', error)
	}
}

function set(idsM, v, result) {
	idsM.forEach((idM) => (result.v[idM] = v))
	result.alarmMdl = store.alarm.module
	result.cacheDO = store.cacheDO
	result.debMdl = store.debMdl
}

function setRW(idsM, v, result) {
	idsM.forEach((idM) => {
		result.v[idM] ??= {}
		result.v[idM].input = v[0]
		result.v[idM].output = v[1]
	})
	result.alarmMdl = store.alarm.module
	result.cacheDO = store.cacheDO
	result.debMdl = store.debMdl
}

module.exports = read
