const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store/index')
const { checklist } = require('../../fn/init_data')

/**
 * Слежение за временем этапа: переключение этапов и завершение демо
 * @param {*} on Настройки Демо: Включить
 * @param {*} demo Аккумулятор демо
 * @returns
 */
function combi(bld, mech) {
	const demo = store.retain[bld._id].demo
	// Демо выключено - выход
	if (demo.cur === null) return

	// Работа по демо-режиму
	
	// Выбор теста
	const q = checklist[demo.order]
	// Увеличение цикла

	def[q.code](bld, mech, demo)

	// Конец демо режимы - выкл всех исполнительных механизмов
	if (demo?.cur >= demo?.total) return safetyOff()
}

module.exports = combi

function safetyOff() {}
