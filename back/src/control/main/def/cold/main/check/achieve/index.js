const { msgB } = require("@tool/message")
const { wrAchieve } = require("@tool/message/achieve")

function achieveTgt(bld, accCold, s) {
	const txt = `T зад. канала = ${accCold.tgtTcnl?.toFixed(1) ?? '--'}°C. Т зад. прод. = ${
		accCold.tgtTprd?.toFixed(1) ?? '--'
	}°C. Зад. влажности = ${s?.mois?.humidity ?? '--'}%`
	wrAchieve(bld._id, bld.type, msgB(bld, 81, txt))
}

module.exports = { achieveTgt }
