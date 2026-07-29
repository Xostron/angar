const { data: store } = require('@store/index')
const { checklist } = require('./fn/init_data')
const { initDemo } = require('./fn/init')
const { check, runTests } = require('./fn/fn')
const { mechB } = require('@tool/command/mech')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(obj) {
	obj?.data?.building?.forEach((bld) => {
		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo
		// Исполнительные механизмы
		const m = mechB(bld?._id, bld?.type, obj, true)

		// Инициализация/очистка аккумулятора демо
		initDemo(bld, s, m, obj)

		// Разрешение тестирования/переключение модулей тестов
		const q = check(bld, s, m, store.retain[bld._id].demo, obj)

		// ДЕМО ВЫКЛЮЧЕН
		if (!q) return

		// ДЕМО ВКЛЮЧЕН
		// Аккумулятор демо режима (сохраняется в retain для
		// просмотра журнала и для работы после перезагрузки POS в полночь)
		const demo = store.retain[bld._id].demo
		// Код текущего теста
		const code = checklist[demo.order].code

		// Обход тестов
		runTests(bld, m, demo, obj, code)

		// console.log(1234, demo)
	})
}

module.exports = { fnDemo }
