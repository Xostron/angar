const { getIdsS } = require('@tool/get/building')

function fnPrepare(bld, sect, obj, s, se, m, automode, acc, data) {
	// Массив секций
	let idsS = getIdsS(obj.data.section, bld._id)
	// Массив секций в авто
	idsS = idsS.filter((idS) => obj.retain[bld._id].mode?.[idS])
	// Список клапанов по секциям в авто
	const vlv = idsS.flatMap((idS) => m?.sect?.[idS]?.vlvS)
	return {idsS, vlv}
}

module.exports = fnPrepare
