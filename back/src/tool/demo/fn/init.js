const { data: store } = require('@store/index')
const { initData } = require('./init_data')
const { stop } = require('./fn')
const { getIdB, getSectAuto } = require('@tool/get/building')

/**
 * Инициализация Демо при старте
 * @param {*} idB ИД склада
 * @param {*} s Настройки демо
 * @returns
 */
function initDemo(bld, s, obj) {
	// Инициализация аккумулятора демо
	store.retain[bld._id].demo ??= JSON.parse(initData)
	const demo = store.retain[bld._id].demo

	// Условия выкл демо (сброс аккумулятора):
	if (stop(bld, s, demo, obj)) return

	// Демо уже в работе - выходим из инициализации
	if (demo?.cur !== null) return console.log('DEMO ALREADY INIT', demo.cur)

	// Первое включение Демо: инициализация
	// 1. Вкл склад
	store.retain[bld._id].start = true
	// 2. Переключение секций из авто в ручной для демо режима
	// Массив секций в авто
	const idS = getSectAuto(bld._id, obj)
	idS.forEach((el) => {
		store.retain[bld._id].mode[el] = false
	})
	// Число отработанных циклов
	demo.cur = 0
	// Всего циклов >= 1
	demo.total = s.total ?? 5
	// Номер текущего теста
	demo.order = 0
	// Инициализируем журнал логов
	demo.checklist = JSON.parse(initData).checklist
	// Точка отсчета демо, цикла, теста
	demo.timeD = new Date()
	demo.timeC = demo.timeD
	demo.timeT = demo.timeD
	// false - однократная остановка еще не выполнялась
	demo.firstOff = false
	console.log('INIT DEMO', demo.cur)
}

module.exports = { initDemo }
