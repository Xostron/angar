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
			// Блокировка записи выходов модулей
			if (i=='689afe4911055545dc2d68df') continue
			console.log(222, 'Начинаем запись в модуля ', obj[i].name)
			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(obj[i]?.buildingId, obj[i]._id, obj[i].ip, obj[i])) continue
			// Запись данных в модуль
			const v = await make(obj[i])
			console.log('=======$$$$$$=====ЗАПИСЬ', 222, obj[i].name, v)
			await pause(100)
			const k = obj[i].name + ' Порт ' + obj[i].port
			ok[k] = v
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
