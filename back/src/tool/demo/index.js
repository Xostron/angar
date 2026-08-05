const { data: store } = require('@store/index')
const { checklist } = require('./fn/init_data')
const { initDemo } = require('./fn/init')
const { check } = require('./fn/fn')
const { mechB } = require('@tool/command/mech')
const runTests = require('./def_stage')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(obj) {
	obj?.data?.building?.forEach((bld) => {
		// Список тестов для данного типа склада
		const checklistPNR = checklist.filter((el) => el.type.includes(bld.type))
		if (!checklistPNR.length) return

		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo
		// Исполнительные механизмы
		const m = mechB(bld?._id, bld?.type, obj, true)

		// Инициализация/очистка аккумулятора демо
		initDemo(bld, s, m, checklistPNR, obj)

		// Разрешение тестирования/переключение модулей тестов
		const q = check(bld, s, m, store.retain[bld._id].demo, checklistPNR, obj)

		// ДЕМО ВЫКЛЮЧЕН
		if (!q) return

		// ДЕМО ВКЛЮЧЕН
		// Аккумулятор демо режима (сохраняется в retain для
		// просмотра журнала и для работы после перезагрузки POS в полночь)
		const demo = store.retain[bld._id].demo
		// Код текущего теста
		const code = checklistPNR[demo.order].code
		// Обход тестов
		runTests(bld, m, demo, checklistPNR, obj, code)

		// console.log(1234, demo)
	})
}

module.exports = { fnDemo }
