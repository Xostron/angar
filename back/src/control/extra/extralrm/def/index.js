const antibliz = require('./antibliz')
const overVlv = require('./over_vlv')
const alrClosed = require('./alr_closed')
const alrClosedB = require('./alr_closed_b')
const local = require('./local')
const localB = require('./local_b')
const vlvCrash = require('./vlv_crash')
const vlvLim = require('./vlv_lim')
const vlvLimB = require('./vlv_lim_building')
const connect = require('./connect')
const genB = require('./genB')
const genS = require('./genS')
const alrValve = require('./alr_valve')
const fanCrash = require('./fan_crash')
const alrStop = require('./alr_stop')
const supply = require('./supply')
const co2 = require('./co2')
const aggregate = require('./aggregate')
const idle = require('./idle')
const deltaMdl = require('./delta_mdl')
const openVin = require('./open_vin')

const def = {
	// Доп. аварии обычного склада
	section: {
		on: {
			overVlv,
			antibliz,
			genS,
		},
		off: {},
		always: {
			alrClosed,
			alrValve,
			local,
			vlvLim,
			vlvCrash,
			fanCrash,
		},
	},
	building: {
		on: {
			idle,
			genB,
			openVin,
		},
		off: {},
		always: {
			connect,
			vlvLimB,
			alrClosedB,
			localB,
			deltaMdl,
		},
	},
	// Доп. аварии холодильника
	cold: {
		on: { idle, genB },
		off: {},
		always: { connect, localB, fanCrash, alrStop, supply, co2, aggregate },
	},
	// Комбинированный склад (холодильник)
	combi: {
		on: { idle, genB },
		off: {},
		always: { connect, localB, fanCrash, alrStop, supply, co2, aggregate },
	},
}

module.exports = def
