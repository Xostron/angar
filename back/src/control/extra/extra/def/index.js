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
const smoking = require('./smoking')
const { accelCOn, accelCAuto } = require('./accel_cold')
const tChannel = require('./t_channel')
const slaveAgg = require('./slave_agg')
const coNormal = require('./co2_normal_combi')

const data = {
	// Обычный склад - Доп функции для секции
	section: {
		// Секция - АВТО
		on: {
			vent,
			tChannel,
		},
		// Секция - ВЫКЛ
		off: {},
		// Секция - АВТО, РУЧНОЙ, ВЫКЛ
		always: {
			warming,
			heating,
			cableS,
		},
	},
	// Обычный склад - Доп функции для склада
	building: {
		// Склад - ВКЛ
		on: {
			accelAuto,
			coNormal,
		},
		// Склад - ВЫКЛ
		off: {},
		// Склад - ВКЛ, ВЫКЛ
		always: {
			accelOn,
			connect,
			reset,
			cableB,
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
			smoking,
			drainOff,
		},
		always: {
			accelCOn,
			connect,
			reset,
			coOn,
			drainOn,
			slaveAgg,
		},
	},
	// Комбинированный склад = {...обычный склад, комбинированный}
	combi: {
		on: {},
		off: {
			smoking,
		},
		always: {
			slaveAgg,
		},
	},
}

module.exports = data
