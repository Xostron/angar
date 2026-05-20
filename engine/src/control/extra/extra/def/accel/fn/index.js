const { ctrlDO } = require('@tool/command/module_output')
const { getStateClr } = require('@tool/cooler')
const { getSectAuto } = require('@tool/get/building')

// Разгонные вентиляторы: Вкл
function on(building, fanA) {
	fanA.forEach((f) => {
		ctrlDO(f, building._id, 'on')
	})
}
// Разгонные вентиляторы: Выкл
function off(building, fanA) {
	fanA.forEach((f) => {
		ctrlDO(f, building._id, 'off')
	})
}
// Разгонные вентиляторы: По времени
function time(building, fanA, acc, se, s) {
	const cur = +new Date().getTime()
	// Фиксируем время работы
	if (!acc?.work) acc.work = cur + s.accel.work / 1

	// Вентиляторы в работе
	if (acc.work > cur) on(building._id, fanA)

	// Фиксируем время ожидания
	if (acc.work < cur && !acc.wait) acc.wait = cur + s.accel.wait / 1

	if (acc.work && acc.wait > cur) off(building._id, fanA)

	if (acc.work && acc.wait < cur) {
		delete acc.work
		delete acc.wait
	}
}

// Разгонные вентиляторы: По температуре
function temp(building, fanA, acc, se, s) {
	const { tprd, tin } = se
	const hyst = 0.3
	// Отключено
	if (tprd == null || tin == null) return off(building._id, fanA)

	// Вкл
	if (tprd - tin > s.accel.difference) on(building._id, fanA)

	// Выкл
	if (tprd - tin + hyst < s.accel.difference) off(building._id, fanA)
}

/**
 * Разрешение работы разгонника
 * @param {*} bld
 * @param {*} m
 * @param {*} acc
 * @param {*} se
 * @param {*} s
 * @return {boolean} true разрешить, false запретить
 */
function check(bld, obj) {
	const idsS = getSectAuto(bld._id, obj)
	for (const idS of idsS) {
		const st = getStateClr(idS, obj)
		// 'Включена оттайка или слив воды' - запрет работы разгонника
		if (st.includes('off-off-on') || st.includes('off-off-off-add')) return false
	}
	return true
}

function clear(bld, fanA, acc) {
	off(bld, fanA)
	delete acc?.work
	delete acc?.wait
}

module.exports = {
	on,
	time,
	temp,
	off,
	check,
	clear,
}
