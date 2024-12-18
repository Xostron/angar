/**
 * Возврат прочитанного значения с модуля ПЛК
 * @param {*} val данные опроса модулей
 * @param {*} o элемент оборудования DO (вентилятор, сигнал, клапан и т.д.)
 */
function puIO(val, moduleId, channel, dio = false) {
	const type = dio ? 'output' : 'input'
	// Модуль с ошибкой
	if (val?.[moduleId]?.error) return null
	if (!val?.[moduleId]) return null
	// Сдвоенный модуль (DI/DO)
	if (val?.[moduleId]?.[type]) return val?.[moduleId]?.[type]?.[channel - 1] ? true : false
	// Модуль DO или DI
	return val?.[moduleId]?.[channel - 1] ? true : false
}

// DO: Биполярные ИМ: Клапан
function biDO(data, val) {
	let r = {}
	for (const o of data) {
		r[o._id] ??= {}
		r[o._id].open = puIO(val, o?.module?.on?.id, o?.module?.on?.channel, true)
		r[o._id].close = puIO(val, o?.module?.off?.id, o?.module?.off?.channel, true)
	}
	return r
}

// DO: Униполярные ИМ: (вентилятор, обогреватель клапанов, соленоид)
function uniDO(data, val) {
	let r = {}
	for (const o of data) r[o._id] = puIO(val, o?.module?.id, o?.module?.channel, true)
	return r
}

module.exports = { biDO, uniDO, puIO }
