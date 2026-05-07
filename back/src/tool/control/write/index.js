const { timeout } = require('@tool/message/plc_module')
const make = require('../make')
const Aboc = require('@tool/abort_controller')
/**
 * Записать данные в модули
 * @param {*} obj Глобальные данные о складе
 * @returns
 */
async function write(arr) {
	console.log(9911, arr)
	try {
		// TDOD Режим только чтения без записи в модуля
		if (process.env.NODE_ENV === 'READ') {
			console.log('process.env.NODE_ENV', process.env.NODE_ENV)
			return null
		}
		if (!arr.length) return null

		const ok = {}
		for (const m of arr) {
			if (Aboc.check()) return

			const idsM = m._id
			const idsB = m.buildingId

			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(idsB, idsM, m.ip, m)) continue

			// Запись данных в модуль
			v = await make(m, 'write')

			await pause(100)

			const k = m.name + m.ip + (m.slaveId ?? '')
			ok[k] = v
		}
		// console.log(9922, ok)
		return ok
	} catch (error) {
		console.error(error)
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
