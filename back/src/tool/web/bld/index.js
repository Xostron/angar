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
			// Страница склады: карточки складов
			order: bld.order ?? 0,
			name: bld.name ?? '--',
			type: bld.type,
			code: bld.code ?? '--',
			countAlr: store.value?.alarm?.count?.[bld._id] ?? 0,
			mode: obj?.value?.total?.[bld._id]?.mode?.[1] ?? '--',
			product: obj.retain?.[bld._id]?.product,
			automode: fnAutomode(bld._id, obj) ?? '--',
			fan: fnFan(bld._id, obj) ? 'Вкл' : 'Выкл',
			tprd: fnSens(bld._id, obj, 'tprd'),
			hin: fnSens(bld._id, obj, 'hin', 'max'),
			achieve: fnAchieve(bld._id),
			// Страница секции: правая панель "Данные склада"
			sidesect: {
				start: obj?.retain?.[bld._id]?.start ?? false,
				tprd: obj?.value?.total?.[bld._id]?.tprd?.min ?? '--',
				hin: obj?.value?.total?.[bld._id]?.hin?.max ?? '--',
				habsin: obj?.value?.humAbs?.in?.[bld._id],
				co2: obj?.value?.total?.[bld._id]?.co2?.max ?? '--',
				// Статус оборудования
				extra: [],
			},
		}
		// console.log(acc[bld._id])
		return acc
	}, {})
}

/**
 * Страница Склады. Левая панель "Уличные датчики"
 * @param {*} obj
 * @returns
 */
function fnBSide(obj) {
	if (!obj?.data?.building) return null

	return {
		sensor: [
			{
				value: fnV(obj.value.total?.tout?.min),
				state: obj.value.total?.tout?.state,
				unit: 'grad',
				code: 'tout',
				name: 'Температура',
			},
			{
				value: fnV(obj.value.total?.point),
				state: fnState(obj.value.total?.point),
				unit: 'grad',
				code: 'point',
				name: 'Точка росы',
			},
			{
				value: fnV(obj.value.total?.hout?.max),
				state: obj.value.total?.hout?.state,
				unit: 'per',
				code: 'hout',
				name: 'Отн. вл.',
			},
			{
				value: fnV(obj.value.humAbs?.out?.com),
				state: fnState(obj.value.humAbs?.out?.com),
				unit: 'hum',
				code: 'habs',
				name: 'Абс. вл.',
			},
		],
		weather: {
			temp: obj.value.total?.tweather ?? '--',
			hum: obj.value.total?.hweather ?? '--',
			update: obj?.data?.weather?.update ?? '--',
			code: obj?.data?.weather?.code ?? 0,
			name: obj?.data?.weather?.weather ?? '--',
		},
		forecast: obj?.data?.weather?.forecast ?? [],
	}
}

module.exports = { fnBCard, fnBSide }

// Проверка значения датчика
function fnV(v) {
	return typeof v == 'number' ? +v.toFixed(1) : '--'
}
// Состояние расчетных датчиков
function fnState(v) {
	return typeof v != 'number' ? 'alarm' : 'on'
}
