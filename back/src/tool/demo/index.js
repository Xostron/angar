const { data: store } = require('@store/index')
const def = require('./def/index')
const { initDemo } = require('./init')
const { mechB } = require('@tool/command/mech')

/**
 * Инициализация демо
 * @param {*} blds
 */
function fnDemo(obj) {
	obj?.data?.building?.forEach((bld) => {
		// Настройки демо
		const s = store.calcSetting[bld._id]?.demo

		// Инициализация и выход из демо
		initDemo(bld._id, s)

		// Демо ПНР
		def[bld.type](bld._id, mechB(bld?._id, bld?.type, obj))
	})
}

module.exports = { fnDemo }
