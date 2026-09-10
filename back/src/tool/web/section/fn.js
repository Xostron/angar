const { data: store } = require('@store/index')
const { getStateClr } = require('@tool/cooler')

/**
 * Карточки секций: режим работы секции
 * @param {*} idB
 * @param {*} idS
 * @param {*} bldType
 * @param {*} retain
 * @returns
 */
function fnSMode(idB, idS, bldType, retain = {}) {
	if (bldType === 'cold') return ['', '']
	switch (retain?.[idB]?.mode?.[idS]) {
		case true:
			return [true, 'Авто']
		case false:
			return [false, 'Руч']
		default:
			return [retain?.[idB]?.mode?.[idS], 'Выкл']
	}
}

/**
 * Карточки секций: агрегация вентиляторов секции - ВНО+ВНО испарителя
 * @param {*} idS
 * @param {*} obj
 * @returns
 */
function fnSFan(idS, obj) {
	// Вентиляторы секции
	const fanS = obj?.data?.fan?.filter((el) => idS === el.owner.id && el.type !== 'accel')
	return fanS.some((el) => obj?.value[el._id]?.state === 'run')
}

/**
 * Карточки секций: клапаны
 * @param {*} idS
 * @param {*} obj
 * @returns
 */
function fnVlv(idS, obj) {
	// Подогрев клапанов: true включен
	const heat = heatVlv(idS, obj)

	let vlv = obj?.data?.valve.reduce((acc, el) => {
		if (!el.sectionId.includes(idS)) return acc
		const r = {
			type: el.type,
			name: el.type === 'in' ? 'Приточный' : 'Выпускной',
			heat,
			value: obj?.value?.[el._id]?.val ?? '--',
			state: obj?.value?.[el._id]?.state ?? '--',
		}
		acc.push(r)
		return acc
	}, [])

	return vlv
}

/**
 * Карточки секций: подогрев клапанов type=heating
 * @param {*} idS ИД секции
 * @param {*} obj Глоб данные
 * @returns
 */
function heatVlv(idS, obj) {
	const heat = obj?.data?.heating?.filter((el) => el.owner.id === idS && el.type === 'heating')
	return heat.some((el) => obj?.value?.outputEq?.[el._id])
}

/**
 * Страница карточки секций: левая панель аварийные сообщения склада
 * @returns {object} Ключ ИД склада, значение - массив авар сообщений barB склада
 */
function fnSBarB() {
	const r = {}
	for (const idB in store.value?.alarm?.barB) {
		r[idB] = []
		for (const code in store.value?.alarm?.barB[idB]) {
			if (['tout', 'hout'].includes(code)) {
				store.value?.alarm?.barB[idB][code]?.[0]
					? r[idB].push(store.value?.alarm?.barB[idB][code]?.[0])
					: null
				continue
			}
			r[idB].push(...store.value?.alarm?.barB[idB][code])
		}
	}
	return r
}

/**
 * Карточка секции: правая панель "Оборудование"
 * Статус
 * @param {*} idB
 * @param {*} obj
 */
function fnSExtra(idB, obj) {
	const types = ['accel', 'wetting', 'ozon', 'smoking', 'heat', 'co2']
}

/**
 * Карточка секции (web)
 * Агрегированное состояние по всем испарителям секции
 * @param {*} idB ИД склад
 * @param {*} obj Глобальные данные (рама, анализ, retain...)
 * @returns
 */
function clrMode(idB, idS, obj) {
	// Получить состояние испарителей по складу
	const clrs = getStateClr(idS, obj)

	// Агрегированное состояние по всем испарителям
	const weight = {
		'on-on-off': { v: 5, name: 'Охлаждение' },
		'off-off-on': { v: 4, name: 'Оттайка' },
		'off-on-off': { v: 3, name: 'Вентилятор' },
		'on-off-off': { v: 2, name: 'Набор холода' },
		'off-off-off-add': { v: 1, name: 'Слив' },
		'off-off-off': { v: 0, name: 'Пауза' },
	}
	// Расчет веса, сортировка по убыванию, первый э-т самый тяжелый -
	// это наше агрегированое состояние по испарителям
	return clrs.map((el) => weight[el]).sort((a, b) => b.v - a.v)[0]
}

module.exports = { fnSMode, fnSFan, fnVlv, heatVlv, fnSBarB, fnSExtra, clrMode }
