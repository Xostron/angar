const { getIdsS } = require('@tool/get/building')


// Состояние увлажнителя: агрегация
function fnWetting(idB, data, obj, result) {
	const { section, device } = obj
	const sect = getIdsS(section, idB)
	result[idB + 'wetting'] = sect.some((idS) => data?.total?.[idS]?.device?.wetting==='run')
	// console.log(111, result[idB + 'wetting'])
}

module.exports = fnWetting
