const { accelOn, accelAuto } = require('./accel')
const vent = require('./vent')
const heating = require('./heating')
const connect = require('./connect')
const reset = require('./reset')
const warming = require('./warming')
const cableB = require('./cableB')
const cableS = require('./cableS')
const { coOn, coAuto } = require('./co2')
const { drainAuto, drainOn, drainOff } = require('./drain')
const smoking = require('./smoking')
const { accelCOn, accelCAuto } = require('./accel_cold')
const tChannel = require('./t_channel')

const data = {
	// Доп функции для секции
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
	// Доп функции для склада
	building: {
		// Склад - ВКЛ
		on: {
			accelAuto,
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
		},
	},
	combi: {
		on: {},
		off: {},
		always: {
			reset,
			connect,
		},
	},
}

module.exports = data
