const { isCombiCold } = require('@tool/combi/is')
const { ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { getStateClr } = require('@tool/cooler')
const { isDemo } = require('@tool/demo/fn/fn')
const { stateEq } = require('@tool/fan')
const { getSectAuto } = require('@tool/get/building')

// Разгонные вентиляторы: Вкл
function on(building, fanA) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(building._id)) return
	fanA.forEach((f) => {
		ctrlDO(f, building._id, 'on')
	})
}
// Разгонные вентиляторы: Выкл
function off(building, fanA) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(building._id)) return
	fanA.forEach((f) => {
		ctrlDO(f, building._id, 'off')
	})
}
// Разгонные вентиляторы: По времени
function time(building, fanA, acc, se, s) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(building._id)) return
	acc.work ??= new Date()
	let time = compareTime(acc.work, s.accel.work)
	// Работа разгонных ВНО
	if (!time) {
		on(building, fanA)
		return
	}
	// Время работы прошло, выкл разгонник
	acc.wait ??= new Date()
	off(building, fanA)
	//  Время ожидания прошло, очищаем аккумулятор для перезапуска разгонников
	time = compareTime(acc.wait, s.accel.wait)
	if (time) {
		delete acc?.work
		delete acc?.wait
	}
}

// Разгонные вентиляторы: По температуре
function temp(building, fanA, acc, se, s) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(building._id)) return
	const { tprd, tin } = se
	const hyst = 0.3
	// Отключено
	if (tprd == null || tin == null) return off(building, fanA)

	// Вкл
	if (tprd - tin > s.accel.difference) on(building, fanA)

	// Выкл
	if (tprd - tin + hyst < s.accel.difference) off(building, fanA)
}

// Разгонные вентиляторы: Холод: в режиме комби-холод
// работает синхронно с ВНО секциями и ВНО испарителя.
// В режиме комби-обычный - остановлен
function cold(building, fanA, acc, se, s, m, obj) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(building._id)) return
	// Хотя бы один вентилятор запущен
	const run = m.fanB.some((f) => stateEq(f._id, obj.value))
	// Комби-холод
	const isCC = isCombiCold(building, obj.retain?.[building._id]?.automode, s)
	if (run && isCC) return on(building, fanA)
	off(building, fanA)
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
	cold,
	off,
	check,
	clear,
}
