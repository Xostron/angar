const signaltype = require('@dict/signal')
/**
 * Формирование маски модуля дискретных выходов (DO)
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @returns moduleId: [0,0,0...] - значения DO
 * Пробегаем по всем исполнительным механизмам для поиска Модуля DO
 */
function outputM(equip, val) {
	let r = {}
	// Клапаны (приточный, выпускной)
	vlv(equip.valve, val, r)
	// Вентиляторы (разгонный, напорный)
	fan(equip.fan, val, r)
	// Обогрев клапанов (секция/камера)
	fan(equip.heaing, val, r)
	// Соленоид
	fan(equip.solenoid, val, r)
	// Испаритель - холодильник
	fan(equip.cooler, val, r)
	// Выходные сигналы
	sig(equip.signal, val, r)
	// Вентилятор - аналоговый выход (находится в binding)
	binding(equip.binding, val, r)
	return r
}

// Поиск модуля DO среди клапанов
function vlv(data, val, r) {
	for (const o of data) {
		if (!Object.hasOwn(r, o?.module?.on?.id)) pull(val, o?.module?.on?.id, r)
		if (!Object.hasOwn(r, o?.module?.off?.id)) pull(val, o?.module?.off?.id, r)
	}
}

// Поиск модуля DO среди ИМ (вентилятор, обогреватель клапанов, соленоид)
function fan(data, val, r) {
	if (!data) return
	for (const o of data) {
		if (Object.hasOwn(r, o?.module?.id) || !o?.module?.id) continue
		pull(val, o?.module?.id, r)
	}
}

// db.signal - особые сигналы с типом выход (сброс аварии, модуль в сети)
function sig(data, val, r) {
	for (const o of data) {
		if (!signaltype.output.includes(o.type)) continue
		pull(val, o.module.id, r)
	}
}
// 
function binding(data, val, r) {
	if (!data) return
	for (const o of data) {
		if (Object.hasOwn(r, o?.moduleId) || !o?.moduleId) continue
		pull(val, o.moduleId, r)
	}
}

// Формирование маски модуля
function pull(val, moduleId, r) {
	// Модуль с ошибкой
	if (val?.[moduleId]?.error) return null
	// Сдвоенный модуль (DI/DO)
	if (val?.[moduleId]?.output) return (r[moduleId] = val?.[moduleId]?.output?.map((el) => (el === 0 ? 0 : 1)))
	// Модуль DO|AO
	return (r[moduleId] = val?.[moduleId]?.map((el) => (el === 0 ? 0 : 1)))
}

module.exports = outputM
