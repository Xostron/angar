const sp = require('@root/routes/api/tenta/read/store/transform/sp')
const { fnSens } = require('@tool/web/bld_card/fn')
const { fnSensByType, fnCircuit } = require('./fn')

function innerCold(bld, sec, obj, sCard) {
	const target = sp(bld._id, bld.type, obj?.retain?.[bld._id]?.automode)
	return {
		tprd: { ...fnSens(bld._id, obj, 'tprd', 'minmax', 'grad', 'tprd'), target: target?.tprd },
		// Датчики температуры продукта (Гистограмма)
		tprdChart: fnSensByType(sec._id, obj?.data?.sensor, obj, 'tprd'),
		// Контур: ипаритель+агрегат
		circuit: fnCircuit(bld, sec, obj),
		target,
	}
}

module.exports = innerCold
