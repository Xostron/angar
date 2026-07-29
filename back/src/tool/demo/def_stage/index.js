const accel = require('./accel')
const allFan = require('./all_fan')
const coolerCool = require('./cooler_cool')
const coolerFlap = require('./cooler_flap')
const coolerHeat = require('./cooler_heat')
const fan = require('./fan')
const heat = require('./heat')
const ozon = require('./ozon')
const valve = require('./valve')
const wetting = require('./wetting')

const data = {
	accel,
	allFan,
	fan,
	heat,
	valve,
	wetting,
	ozon,
	coolerCool,
	coolerFlap,
	coolerHeat,
}

module.exports = data
