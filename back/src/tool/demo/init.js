const { data: store } = require('@store/index')
const initDD = require('./init_data')

/**
 * Инициализация Демо при старте
 * @param {*} idB ИД склада
 * @param {*} s Настройки демо
 * @returns
 */
function initDemo(idB, s) {
	// Инициализация аккумулятора демо
	store.retain[idB].demo ??= JSON.parse(initDD)
	const demo = store.retain[idB].demo

	// Условия выкл демо (сброс аккумулятора):
	// 1. При выключении склада во время демо - выкл демо
	// 2. Демо выключена по кнопке в настройках
	// 3. Демо ПНР окончен
	const tt = [
		!store.retain[idB].start && typeof demo?.cur == 'number',
		!s?.on,
		demo?.cur >= demo?.end,
	]
	if (tt.some(Boolean)) return offDemo(idB, demo)

	// Демо уже в работе - выходим из инициализации
	if (demo?.cur !== null) return

	// Первое включение Демо: инициализация
	// 1. Вкл склад
	store.retain[idB].start = true
	// Число отработанных циклов
	demo.cur ??= 0
	// Всего циклов >= 1
	demo.total = s.total ?? 1
	// Номер текущего теста
	demo.order = 0
	
	console.log('INIT DEMO', demo.cur)
}

function offDemo(idB, demo) {
	// Очищаем аккумулятор один раз
	if (demo?.cur === null) return
	console.log('OFF DEMO')
	// Сбрасываем аккумулятор демо
	store.retain[idB].demo = JSON.parse(initDD)
	// Выкл демо в настройках
	store.retain[idB].setting.demo ??= {}
	store.retain[idB].setting.demo.on ??= {}
	store.retain[idB].setting.demo.on.on = false
	// Выкл склад
	store.retain[idB].start = false
}

module.exports = { initDemo }
