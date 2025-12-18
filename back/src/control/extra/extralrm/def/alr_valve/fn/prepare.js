const { getIdsS } = require('@tool/get/building')

function fnPrepare(bld, sect, obj, s, se, m, automode, acc, data) {
	// Массив секций
	const idsS = getIdsS(obj.data.section, bld._id)
	// Массив секций в авто (для клапанов по секциям в авто)
	const onIdsS = idsS.filter((idS) => obj.retain[bld._id].mode?.[idS])
	// Список клапанов секции в любом режиме
	const vlv = idsS.flatMap((idS) => m?.sect?.[idS]?.vlvS)
	return { idsS, vlv, onIdsS }
}

module.exports = fnPrepare
