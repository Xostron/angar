const { data: store } = require('@store/index')
const { initData } = require('./init_data')
const { offDemo } = require('./fn')

/**
 * Инициализация Демо при старте
 * @param {*} idB ИД склада
 * @param {*} s Настройки демо
 * @returns
 */
function initDemo(idB, s) {
	// Инициализация аккумулятора демо
	store.retain[idB].demo ??= JSON.parse(initData)
	const demo = store.retain[idB].demo

	// Демо уже в работе - выходим из инициализации
	if (demo?.cur !== null) return console.log('DEMO ALREADY INIT', demo.cur)

	// Первое включение Демо: инициализация
	// 1. Вкл склад
	store.retain[idB].start = true
	// Число отработанных циклов
	demo.cur = 0
	// Всего циклов >= 1
	demo.total = s.total ?? 1
	// Номер текущего теста
	demo.order = 0
	// Точка отсчета демо, цикла, теста
	demo.timeD = new Date()
	demo.timeC = demo.timeD
	demo.timeT = demo.timeD

	console.log('INIT DEMO', demo.cur)
}

module.exports = { initDemo }
