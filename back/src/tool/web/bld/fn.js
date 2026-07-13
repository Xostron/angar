const { data: store } = require('@store/index')
const { getStateClr } = require('@tool/cooler')
const { getIdsS } = require('@tool/get/building')

/**
 * Агрегация режима работы секций
 * @param {*} bld Склад
 * @param {*} ids Массив ИД секций
 * @returns {Array} mode
 * Вентилируемы и комби склад: (авто true, ручной false, выкл null|undefined) [true, 'Авто']
 * Холодильник - не имеет режима работы секций ['','']
 */
function fnMode(bld, ids, retain) {
	// Холодильник
	if (bld.type === 'cold') return ['', '']
	// Вентилируемый и комби склад
	// Авто
	const auto = ids.some((idS) => retain?.[bld?._id]?.mode?.[idS])
	if (auto) return [true, 'Авто']

	// Ручной
	const man = ids.some((idS) => retain?.[bld?._id]?.mode?.[idS] === false)
	if (man) return [false, 'Руч']

	// Выкл
	return [null, 'Выкл']
}

/**
 * Карточка склада (web)
 * Режим: Сушка, хранение, дефростация, набор холода, оттайка
 * @param {*} idB ИД склад
 * @param {*} obj Глобальные данные (рама, анализ, retain...)
 * @returns
 */
function fnAutomode(idB, obj) {
	switch (obj?.value?.building?.[idB]?.bldType) {
		case 'cold':
			return clrMode(idB, obj)
		case 'normal':
		case 'combi_normal':
			const am = obj?.retain?.[idB]?.automode
			if (am !== 'cooling') return am
			return obj?.value?.total?.[idB]?.submode
		case 'combi_cold':
			return clrMode(idB, obj)?.name
		default:
			return obj?.retain?.[idB]?.automode
	}
}

/**
 * Карточка склада (web)
 * Агрегированное состояние по всем испарителям
 * @param {*} idB ИД склад
 * @param {*} obj Глобальные данные (рама, анализ, retain...)
 * @returns
 */
function clrMode(idB, obj) {
	// Секции склада
	const idsS = getIdsS(obj?.data?.section, idB)
	// Получить состояние испарителей по складу
	const allClr = idsS.flatMap((idS) => getStateClr(idS, obj))

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
	return allClr.map((el) => weight[el]).sort((a, b) => b.v - a.v)[0]
}

/**
 * Карточка склада
 * ВНО: напорные, вно испарителя.
 * Включен ли хоть один ВНО
 * @param {*} idB
 * @param {*} obj
 * @returns
 */
function fnFan(idB, obj) {
	// Секции склада
	const idsS = getIdsS(obj?.data?.section, idB)
	// Все вентиляторы склада
	const fanB = obj?.data?.fan?.filter((el) => idsS.includes(el.owner.id) && el.type !== 'accel')
	return fanB.some((el) => obj?.value[el._id])
}

/**
 * Значение датчика min, max
 * @param {*} idB ИД склада
 * @param {*} obj Глобальные данные
 * @param {*} code Код датчика
 * @returns 
 */
function fnSens(idB, obj, code) {
	return obj?.value?.total?.[idB]?.[code]
}

/**
 * Сообщения достижения
 * @param {*} idB ИД склада
 * @returns 
 */
function fnAchieve(idB) {
	return store.value?.alarm?.achieve?.[idB] ?? []
}

module.exports = { fnMode, fnAutomode, clrMode, fnFan, fnSens, fnAchieve }
