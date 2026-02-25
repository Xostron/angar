const { fanAccel, heating, device, fnSolHeat } = require('./fn/other')
const { data: store } = require('@store')
const vlv = require('./fn/valve')
const fan = require('./fn/fan')
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
	fnSolHeat(obj)
}

module.exports = writeLock
