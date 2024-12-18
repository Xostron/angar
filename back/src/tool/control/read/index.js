const readRTU = require('./rtu')
const readTCP = require('./tcp')
const { data: store, timeout, isErrM } = require('@store')

// Чтение модулей
async function read(arr, obj) {
	try {
		const data = {}
		for (let i = 0; i < arr.length; i++) {
			let a
			if (!timeout(arr[i].buildingId, arr[i]._id, arr[i].ip, arr[i])) {
				continue
			}
			switch (arr[i].interface) {
				case 'rtu':
					a = await readRTU(arr[i].ip, arr[i].port, arr[i])
					break
				case 'tcp':
					a = await readTCP(arr[i].ip, arr[i].port, arr[i])
					break
			}
			// флаг первого запуска сервера
			store.startup = false
			const k = arr[i]._id
			const buildingId = arr[i].buildingId
			await pause(store.tPause)
			// ошибка модуля
			if (!(a instanceof Array)) {
				data[k] = a
				data.error = buildingId
				continue
			}
			// нет ошибки
			switch (arr[i].use) {
				case 'r':
				case 'w':
					data[k] = a[0]
					break
				case 'rw':
					data[k] ??= {}
					data[k].input = a[0]
					data[k].output = a[1]
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
function errConnect() {}

module.exports = read
