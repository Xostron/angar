const { msgB } = require('@tool/message')
const { wrAchieve } = require('@tool/message/achieve')

/**
 * Достижение: Т задания канала, продукта и влажности
 * @param {*} bld
 * @param {*} accCold
 * @param {*} s
 */
function achieveTgt(bld, accCold, s) {
	const txt = `T зад. канала = ${accCold.tgtTcnl?.toFixed(1) ?? '--'}°C. Т зад. прод. = ${
		accCold.tgtTprd?.toFixed(1) ?? '--'
	}°C. Зад. влажности = ${s?.mois?.humidity ?? '--'}%`
	const o = msgB(bld, 81, txt)
	wrAchieve(bld._id, bld.type, o)
}

module.exports = { achieveTgt }
