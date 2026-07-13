const { data: store } = require('@store/index')
const { fnAutomode, fnFan, fnSens, fnAchieve } = require('./fn')

/**
 * Карточки складов
 * @param {*} obj
 * @returns
 */
function fnBCard(obj) {
	if (!obj?.data?.building) return null

	return obj.data.building.reduce((acc, bld) => {
		// Режим работы: агрегация режимов секций
		acc[bld._id] = {
			order: bld.order ?? '--',
			name: bld.name ?? '--',
			type: bld.type ?? '--',
			code: bld.code ?? '--',
			countAlr: store.value?.alarm?.count?.[bld._id] ?? 0,
			mode: obj?.value?.total?.[bld._id]?.mode?.[1] ?? '--',
			product: obj.retain?.[bld._id]?.product?.name ?? '--',
			automode: fnAutomode(bld._id, obj) ?? '--',
			fan: fnFan(bld._id, obj) ? 'Вкл' : 'Выкл',
			min: fnSens(bld._id, obj, 'tprd')?.min ?? '--',
			max: fnSens(bld._id, obj, 'tprd')?.max ?? '--',
			hin: fnSens(bld._id, obj, 'hin')?.max ?? '--',
			achieve: fnAchieve(bld._id),
		}
		return acc
	}, {})
}

function fnBSide(obj) {
	if (!obj?.data?.building) return null

	// obj.data.building

	// console.log(obj?.data?.weather)
	return {
		tout: +obj.value.total?.tout?.min?.toFixed(1) ?? '--',
		point: +obj.value.total?.point?.toFixed(1) ?? '--',
		hout: +obj.value.total?.hout?.max?.toFixed(1) ?? '--',
		habs: obj.value.humAbs?.out?.com ?? '--',
		tweather: +obj.value.total?.tweather?.value?.toFixed(1) ?? '--',
		hweather: +obj.value.total?.hweather?.value?.toFixed(1) ?? '--',
		updWeather: obj?.data?.weather?.update ?? '--',
		codeWeather: obj?.data?.weather?.code ?? 0,
		nameWeather: obj?.data?.weather?.weather ?? '--',
		forecast: obj?.data?.weather?.forecast ?? [],
	}
}

module.exports = { fnBCard, fnBSide }
