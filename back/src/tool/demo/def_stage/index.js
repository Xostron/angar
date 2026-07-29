const accel = require('./accel')
const allFan = require('./all_fan')
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
	ozon
}

module.exports = data
