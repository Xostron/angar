const writeRTU = require('./rtu')
const writeTCP = require('./tcp')
const { timeout } = require('@tool/message/plc_module')

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
			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(obj[i]?.buildingId, obj[i]._id, obj[i].ip, obj[i])) continue
			// Запись данных в модуль
			// if (obj[i].ip === '192.168.21.125')
			// console.log(
			// 	'\x1b[44m',
			// 	'Запись модулей DO',
			// 	obj[i].ip,
			// 	obj[i].value,
			// 	'\x1b[0m'
			// )

			const v = await make(obj[i])
			await pause(100)
			const k = obj[i].name + ' Порт ' + obj[i].port
			ok[k] = v
			// if (obj[i].ip === '192.168.21.127')
			// 	console.log(999, 'write', obj[i].ip, obj[i].value, v !== true ? 'FUCKUP' : v)
		}
		return ok
	} catch (error) {
		console.log(error)
		throw new Error('Запись: связь RTU/TCP потеряна', error)
	}
}

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n))
}
// Запись данных в модуль
async function make(o) {
	switch (o.interface) {
		case 'rtu':
			return await writeRTU(o.ip, o.port, o)

		case 'tcp':
			return await writeTCP(o.ip, o.port, o)
		default:
			return
	}
}

module.exports = write
