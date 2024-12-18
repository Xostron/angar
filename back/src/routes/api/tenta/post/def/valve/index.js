const { data: store, setTune } = require('@store')
const { findOne } = require('@tool/json')
const fnVlv = require('./fn')

async function valve(obj) {
	try {
		const vlv = await findOne('valve', { key: '_id', v: obj.valveId })
		// Останов калибровки
		const o = { [obj.valveId]: { _stage: null } }
		setTune(o)
		// console.log(1111, obj)
		// Команда управления
		fnVlv(vlv, obj)
		return true
	} catch (error) {
		return error
	}
}

module.exports = valve

/**
Valve
{"buildingId":"65d4aed4b47bb93c40100fd5", "valveId":"65d6f88d6109ee21ac4ce8ed", "value":"open"}
{"buildingId":"65d4aed4b47bb93c40100fd5", "valveId":"65d6f88d6109ee21ac4ce8ed", "value":"close"}
{"buildingId":"65d4aed4b47bb93c40100fd5", "valveId":"65d6f88d6109ee21ac4ce8ed", "value":"stop"}
{"buildingId":"65d4aed4b47bb93c40100fd5", "valveId":"65d6f88d6109ee21ac4ce8ed",  "sp":"10"}
 */
