const readRTU = require('./rtu')
const readTCP = require('./tcp')
const { data: store, timeout, isErrM } = require('@store')

// Чтение модулей
async function read(arr, obj) {
	try {
		const data = {}
		for (let i = 0; i < arr.length; i++) {
			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(arr[i].buildingId, arr[i]._id, arr[i].ip, arr[i])) continue
			// Чтение данных в модуль
			const v = await make(arr[i])
			// флаг первого запуска сервера
			store.startup = false
			const k = arr[i]._id
			const buildingId = arr[i].buildingId
			await pause(store.tPause)
			// ошибка модуля
			if (!(v instanceof Array)) {
				data[k] = v
				data.error = buildingId
				continue
			}
			// нет ошибки
			switch (arr[i].use) {
				case 'r':
				case 'w':
					data[k] = v[0]
					break
				case 'rw':
					data[k] ??= {}
					data[k].input = v[0]
					data[k].output = v[1]
					break
				default:
					break
			}
		}
		return data
	} catch (error) {
		console.log(error)
		throw Error('Чтение: связь RTU/TCP потеряна')
	}
}

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n))
}

// Нет связи
async function make(o) {
	switch (o.interface) {
		case 'rtu':
			return await readRTU(o.ip, o.port, o)
		case 'tcp':
			return await readTCP(o.ip, o.port, o)
	}
}

module.exports = read
