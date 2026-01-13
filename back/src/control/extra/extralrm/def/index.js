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
const banTimer = require('./ban_timer')
const deltaMdl = require('./delta_mdl')
const openVin = require('./open_vin')
const stableVno = require('./stable_vno')
const notTune = require('./not_tune')
const debdo = require('./deb_do')
const battery = require('./battery')

const def = {
	// Доп. аварии обычного склада
	section: {
		on: {
			genS,
			stableVno,
		},
		off: {},
		always: {
			alrClosed,
			local,
			fanCrash,
			vlvLim,
			vlvCrash,
			antibliz,
			overVlv,
		},
	},
	building: {
		on: {
			banTimer,
			genB,
		},
		off: {},
		always: {
			connect,
			vlvLimB,
			alrClosedB,
			localB,
			deltaMdl,
			notTune,
			debdo,
			battery,
			openVin,
			alrValve,
		},
	},
	// Доп. аварии холодильника
	cold: {
		on: { banTimer, genB },
		off: {},
		always: { connect, localB, fanCrash, alrStop, supply, co2, aggregate, debdo, battery },
	},
	// Комбинированный склад (холодильник)
	combi: {
		on: { banTimer, genB },
		off: {},
		always: { connect, localB, fanCrash, alrStop, supply, co2, aggregate, notTune },
	},
}

module.exports = def
