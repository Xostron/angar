const { data: store } = require('@store/index')
const { mechB } = require('@tool/command/mech')
const { checklist } = require('./fn/init_data')
const { initDemo } = require('./fn/init')
const { check } = require('./fn/fn')
const def = require('./def_stage')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(obj) {
	obj?.data?.building?.forEach((bld) => {
		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo

		// Инициализация/очистка аккумулятора демо
		initDemo(bld._id, s)

		// Разрешение тестирования/переключение модулей тестов
		const q = check(bld._id, s, store.retain[bld._id].demo)
		// Тестирование запрещено - выход
		if (!q) return

		// Модули тестов
		const demo = store.retain[bld._id].demo
		const code = checklist[demo.order].code
		def[code](bld, obj, mechB(bld?._id, bld?.type, obj), store.retain[bld._id].demo)
		console.log(1234, demo.checklist.accel)
	})
}

module.exports = { fnDemo }
