const { data: store } = require('@store')
const { timeout } = require('@tool/message/plc_module')
const make = require('../make')
const fnCacheDO = require('./fn/cache')
const Aboc = require('@tool/abort_controller')
/**
 * Чтение модулей
 * @param {*} arr Массив модулей
 * @param {*} obj Глобальные данные по складу
 * @returns {Promise<object>} Объект: ключ-id модуля, значение-массив показаний модуля
 */
async function read(arr, obj) {
	try {
		const data = {}
		for (let i = 0; i < arr.length; i++) {
			if (Aboc.check()) return
			const idM = arr[i]._id
			// Разрешение на чтение модуля
			if (!timeout(arr[i]?.buildingId, arr[i]._id, arr[i].ip, arr[i])) continue

			// Чтение
			let v = await make(arr[i])
			// TODO Кэш для модулей DO
			// if (arr[i].ip === '192.168.21.125') console.log(8800, v)
			v = fnCacheDO(v, arr[i])
			// if (arr[i].ip === '192.168.21.125') console.log(8811, v)
			// флаг первого запуска сервера
			store.startup = false
			const buildingId = arr[i].buildingId
			await pause(store.tPause)
			// Ошибка модуля -> если ответ от модуля не массив чисел => модуль не прочитан
			if (!(v instanceof Array)) {
				data[idM] = v
				data.error = buildingId
				continue
			}
			// Модуль прочитан без ошибок
			switch (arr[i].use) {
				case 'r':
				case 'w':
					data[idM] = v[0]
					break
				case 'rw':
					data[idM] ??= {}
					data[idM].input = v[0]
					data[idM].output = v[1]
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

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n))
}

module.exports = read

// /**
//  *
//  * @param {object} o Данные о модуле
//  * @returns {Promise<[][]>} Массив значений [[...input], [...output]] модуля
//  */
// async function makeOld(o, { signal } = {}) {
// 	switch (o.interface) {
// 		case 'rtu':
// 			return await readRTU(o.ip, o.port, o)
// 		case 'tcp':
// 			return await readTCP(o.ip, o.port, o)
// 	}
// }
