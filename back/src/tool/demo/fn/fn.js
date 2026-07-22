const { data: store } = require('@store/index')
const { initData, checklist } = require('./init_data')
const { compareTime } = require('@tool/command/time')

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

	// Выкл демо в настройках
	store.retain[idB].setting.demo ??= {}
	store.retain[idB].setting.demo.on ??= {}
	store.retain[idB].setting.demo.on.on = false

	// Выкл склад
	store.retain[idB].start = false
}

/**
 * Проверка хода тестов и завершение демо:
 * Переключение теста
 * Переключение цикла
 * Конец демо: Очистка аккумуляторов демо
 * @param {*} demo
 * @returns {boolean} true - разрешить тесты
 */
function check(idB, s, demo) {
	// Демо выключено - выход
	if (demo.cur === null) return false

	// // Контроль времени теста в текущем цикле
	// const t = demo.order < checklist.length && compareTime(demo.timeT, checklist[demo.order].last)
	// // Время теста прошло - переключаем на следующий
	// if (t) {
	// 	demo.order++
	// 	// Время теста
	// 	demo.timeT = new Date()
	// }

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
	if (stop(idB, s, demo)) return false

	return true
}

/**
 * Стоп демо и очистка аккумуляторов
 * @param {*} idB
 * @param {*} s
 * @param {*} demo
 * @returns {boolean} true - стоп
 */
function stop(idB, s, demo) {
	// Условия выкл демо (сброс аккумулятора):
	// 1. При выключении склада во время демо - выкл демо
	// 2. Демо выключена по кнопке в настройках
	// 3. Демо ПНР окончен
	const tt = [
		!store.retain[idB].start && typeof demo?.cur == 'number',
		!s?.on,
		demo.total!==null && demo.cur!==null && demo?.cur >= demo.total,
	]
	if (tt.some(Boolean)) {
		clear(idB, demo)
		return true
	}
	console.log('CONTINUE DEMO')
	return false
}

module.exports = { stop, clear, check }
