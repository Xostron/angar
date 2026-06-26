const { timeout } = require('../../module/timeout')
const { store } = require('@store/index')
const make = require('../make')
const { delay } = require('../../time')
// const Aboc = require('@tool/abort_controller')
/**
 * Записать данные в модули
 * @param {*} obj Глобальные данные о складе
 * @returns
 */
async function write(arr = []) {
	try {
		// TODO Режим только чтения без записи в модуля
		if (process.env.NODE_ENV === 'READ') {
			console.log('process.env.NODE_ENV', process.env.NODE_ENV)
			return null
		}
		if (!arr.length) return null

		const ok = {}
		for (const m of arr) {
			// if (Aboc.check()) return

			const idsM = m._id
			const idsB = m.buildingId

			// Проверка модуля (антидребезг или ошибка модуля)
			if (!timeout(idsB, idsM, m.ip, m)) continue

			// Запись данных в модуль
			v = await make(m, 'write')

			await delay(store.tPause)

			const k = m.name + m.ip + (m.slave ?? '')
			ok[k] = v
		}
		return ok
	} catch (error) {
		console.error(error)
	}
}


module.exports = write
