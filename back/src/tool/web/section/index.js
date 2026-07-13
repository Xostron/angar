const { data: store } = require('@store/index')
const { fnAutomode, fnFan, fnSens, fnAchieve } = require('./fn')

/**
 * Карточка склада
 * @param {*} obj
 * @returns
 */
function fnSCard(obj) {
	if (!obj.data?.building) return null

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

module.exports = { fnSCard }
