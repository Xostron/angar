const { checklist } = require('./init_data')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store/index')
const runTests = require('../def_stage')

/**
 * Проверка хода тестов и завершение демо:
 * Переключение теста
 * Переключение цикла
 * Конец демо: Очистка аккумуляторов демо
 * @param {*} demo
 * @returns {boolean} true - разрешить тесты
 */
function check(bld, s, m, demo, obj) {
	// Демо выключено - выход
	if (demo.cur === null) return false

	// Контроль времени теста в текущем цикле
	let t = false
	if (demo.order < checklist.length) {
		const test = checklist[demo.order]
		const last = test.code != 'fan' ? test.last : (m.fanBexc.length ?? 1) * test.last
		t = compareTime(demo.timeT, last)
	}
	// Время теста прошло - переключаем на следующий
	if (t) {
		demo.order++
		// Время теста
		demo.timeT = new Date()
	}

	// Проверка цикла - переключение цикла
	if (demo.order > checklist.length - 1) {
		// Переключение теста
		demo.order = 0
		// Переключение цикла
		demo.cur++
		// Время цикла
		demo.timeC = new Date()
		// Время теста
		demo.timeT = demo.timeC
	}

	// Условия выкл демо (сброс аккумулятора):
	if (stop(bld, s, m, demo, obj)) return false

	return true
}

/**
 * Стоп демо и очистка аккумуляторов
 * @param {*} bld Склад
 * @param {*} s Пользовательские настройки демо
 * @param {*} demo Аккумулятор демо
 * @returns {boolean} true - стоп
 */
function stop(bld, s, m, demo, obj) {
	// Условия выкл демо (сброс аккумулятора):
	// 1. При выключении склада во время демо - выкл демо
	// 2. Демо выключена по кнопке в настройках
	// 3. Демо ПНР окончен
	const tt = [
		!store.retain[bld._id].start && typeof demo?.cur == 'number',
		!s?.on,
		demo.total !== null && demo.cur !== null && demo?.cur >= demo.total,
	]
	if (tt.some(Boolean)) {
		clear(bld._id, demo)
		// Если демо выключен - однократно выключаем все исполнительные механизмы
		if (demo.cur === null && !demo.firstOff) {
			runTests(bld, m, demo, obj)
			demo.firstOff = true
		}

		console.log('STOP DEMO')
		return true
	}
	return false
}

/**
 * Очистка акуумуляторов и настроек демо, выкл склада
 * @param {*} idB
 * @param {*} demo
 * @returns
 */
function clear(idB, demo) {
	// Очищаем аккумулятор один раз
	if (demo?.cur === null) return console.log('DEMO ALREADY OFF')
	console.log('DEMO OFF')

	// Сбрасываем аккумулятор демо
	store.retain[idB].demo.cur = null
	store.retain[idB].demo.total = null
	store.retain[idB].demo.order = 0
	store.retain[idB].demo.accF = {}
	store.retain[idB].demo.accVlv = {}
	store.retain[idB].demo.accClr = {}
	store.retain[idB].demo.accAllFan = {}

	// Выкл демо в настройках
	store.retain[idB].setting.demo ??= {}
	store.retain[idB].setting.demo.on ??= {}
	store.retain[idB].setting.demo.on.on = false

	// Выкл склад
	store.retain[idB].start = false
}

function isDemo(idB) {
	return typeof store.retain?.[idB]?.demo?.cur == 'number'
}

module.exports = { stop, clear, check, isDemo }
