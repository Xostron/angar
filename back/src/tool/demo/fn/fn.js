const { data: store } = require('@store/index')
const { initData } = require('./init_data')

/**
 * Очистка акуумуляторов и настроек демо, выкл склада
 * @param {*} idB
 * @param {*} demo
 * @returns
 */
function offDemo(idB, demo) {
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
function check(idB, demo) {
	// Демо выключено - выход
	if (demo.cur === null) return false

	// Контроль времени теста в текущем цикле
	const t = demo.order < checklist.length && compareTime(timeT, checklist[demo.order].last)
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
	// 1. При выключении склада во время демо - выкл демо
	// 2. Демо выключена по кнопке в настройках
	// 3. Демо ПНР окончен
	const tt = [
		!store.retain[idB].start && typeof demo?.cur == 'number',
		demo?.cur >= demo?.total,
		!s?.on,
	]
	if (tt.some(Boolean)) {
		offDemo(idB, demo)
		return false
	}

	return true
}

module.exports = { offDemo, check }
