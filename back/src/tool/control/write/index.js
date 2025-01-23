const writeRTU = require('./rtu')
const writeTCP = require('./tcp')
const { data: store, timeout, isErrM } = require('@store')

/**
 * Записать данные в модули
 * @param {*} obj Глобальные данные о складе
 * @returns
 */
async function write(obj) {
	const {output} = obj
	try {
		if (!output) return null
		const ok = {}
		for (const i in output) {
			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(output[i].buildingId, output[i]._id, output[i].ip, output[i], obj)) continue
			// Запись данных в модуль
			const v = await make(output[i], obj.acc)
			await pause(100)
			const k = output[i].name + ' Порт ' + output[i].port
			ok[k] = v
		}
		return ok
	} catch (error) {
		console.log(error)
		throw Error('Запись: связь RTU/TCP потеряна', error)
	}
}

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n))
}
// Запись данных в модуль
async function make(o, acc) {
	switch (o.interface) {
		case 'rtu':
			return await writeRTU(o.ip, o.port, o, acc)

		case 'tcp':
			return await writeTCP(o.ip, o.port, o, acc)
		default:
			return
	}
}

module.exports = write
