const { data: store } = require('@store/index')
const { mechB } = require('@tool/command/mech')
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
		initDemo(bld._id, s, demo)

		// Разрешение тестирования/переключение модулей тестов
		const q = check(store.retain[idB].demo)
		// Тестирование запрещено - выход
		if (!q) return

		// Модули тестов
		def[q.code](bld, mechB(bld?._id, bld?.type, obj), store.retain[idB].demo)
	})
}

module.exports = { fnDemo }
