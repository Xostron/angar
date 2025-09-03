const { vlv, fan, fanAccel, heating, device } = require('./fn')
const { data: store } = require('@store')

/**
 * Применение блокировок к командам управления выходами
 * @param {*} obj Данные по оборудованию
 * @returns
 */
function writeLock(obj) {
	const s = store.calcSetting
	vlv(obj, s)
	fan(obj, s)
	fanAccel(obj, s)
	heating(obj, s)
	device(obj, s)
}

module.exports = writeLock
