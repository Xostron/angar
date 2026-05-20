const { accelOn, accelAuto } = require('./accel')
const vent = require('./vent')
const heating = require('./heating')
const connect = require('./connect')
const reset = require('./reset')
const warming = require('./warming')
const cableB = require('./cableB')
const cableS = require('./cableS')
const { coOn, coAuto } = require('./co2_cold')
const { drainAuto, drainOn, drainOff } = require('./drain')
const smokingC = require('./smoking_cold')
const smokingNC = require('./smoking_normal_combi')
const ozonC = require('./ozon_cold')
const ozonNC = require('./ozon_normal_combi')
const { accelCOn, accelCAuto } = require('./accel_cold')
const tChannel = require('./t_channel')
const slaveAgg = require('./slave_agg')
const co2NormalCombi = require('./co2_normal_combi')
const connectLost = require('./connect_lost')
const wetting = require('./wetting')

const data = {
	// Обычный склад и комби склад - Доп функции для секции
	section: {
		// Секция - АВТО
		on: {
			tChannel,
		},
		// Секция - ВЫКЛ
		off: {},
		// Секция - АВТО, РУЧНОЙ, ВЫКЛ
		always: {
			warming,
			heating,
			cableS,
			wetting,
		},
	},
	// Обычный склад - Доп функции для склада
	building: {
		// Склад - ВКЛ
		on: {
			accelAuto,
		},
		// Склад - ВЫКЛ
		off: {
			smokingNC,
			ozonNC,
		},
		// Склад - ВКЛ, ВЫКЛ
		always: {
			accelOn,
			connect,
			cableB,
			connectLost,
			reset,
			vent,
			co2NormalCombi,
		},
	},
	// Склад холодильник
	cold: {
		on: {
			accelCAuto,
			coAuto,
			drainAuto,
		},
		off: {
			smokingC,
			ozonC,
			drainOff,
		},
		always: {
			accelCOn,
			connect,
			reset,
			coOn,
			drainOn,
			slaveAgg,
			connectLost,
			wetting,
		},
	},
	// Комбинированный склад
	combi: {
		on: {},
		off: {},
		always: {
			slaveAgg,
		},
	},
}

module.exports = data
