const { vlv, fan, fanAccel, heating, device,fanCooler } = require('./fn')

/**
 * Применение блокировок к командам управления выходами
 * @param {*} obj Данные по оборудованию
 * @returns
 */
function writeLock(obj) {
	vlv(obj)
	fan(obj)
	// fanCooler(obj)
	fanAccel(obj)
	heating(obj)
	device(obj)
}

module.exports = writeLock
