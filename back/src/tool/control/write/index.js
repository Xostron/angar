const { timeout } = require('@tool/message/plc_module')
const make = require('../make')
const Aboc = require('@tool/abort_controller')
/**
 * Записать данные в модули
 * @param {*} obj Глобальные данные о складе
 * @returns
 */
async function write(obj) {
	try {
		if (!obj) return null
		const ok = {}
		for (const i in obj) {
			if (Aboc.check()) return
			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(obj[i]?.buildingId, obj[i]._id, obj[i].ip, obj[i])) continue

			// Запись данных в модуль
			v = await make(obj[i], 'write')

			await pause(100)
			const k = obj[i].name + ' Порт ' + obj[i].port
			ok[k] = v
		}
		return ok
	} catch (error) {
		console.log(error)
	}
}

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n))
}

module.exports = write

// Запись данных в модуль
// async function makeOld(o) {
// 	switch (o.interface) {
// 		case 'rtu':
// 			return await writeRTU(o.ip, o.port, o)

// 		case 'tcp':
// 			return await writeTCP(o.ip, o.port, o)
// 		default:
// 			return
// 	}
// }
