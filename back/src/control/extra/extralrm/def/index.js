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
const supplyB = require('./supply_b')
const co2 = require('./co2')
const aggregate = require('./aggregate')
const banTimer = require('./ban_timer')
const deltaMdl = require('./delta_mdl')
const openVin = require('./open_vin')
const stableVno = require('./stable_vno')
const notTune = require('./not_tune')
const debdo = require('./deb_do')
const battery = require('./battery')
const ozon = require('./ozon')
const hCoolerCrash = require('./heating_cooler')
const fCoolerCrash = require('./flap_cooler')
const bldOff = require('./bld_off')

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
			antibliz,
			overVlv,
			supply,
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
			supplyB,
			ozon,
			vlvCrash,
			hCoolerCrash,
			fCoolerCrash,
			bldOff
		},
	},
	// Доп. аварии холодильника
	cold: {
		on: { banTimer, genB },
		off: {},
		always: {
			connect,
			localB,
			fanCrash,
			alrStop,
			supplyB,
			co2,
			aggregate,
			debdo,
			battery,
			ozon,
		},
	},
	// Комбинированный склад (холодильник)
	combi: {
		on: { banTimer, genB },
		off: {},
		always: { connect, localB, fanCrash, alrStop, supplyB, co2, aggregate, notTune, ozon },
	},
}

module.exports = def
