const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store/index')
const initDD = require('../init_data')

/**
 * Слежение за временем этапа: переключение этапов и завершение демо
 * @param {*} on Настройки Демо: Включить
 * @param {*} demo Аккумулятор демо
 * @returns
 */
function combi(idB, mech) {
	const demo = store.retain[idB].demo
	// Демо выключено - выход
	if (demo.cur === null) return

	// Работа по демо-режиму
	// Увеличение цикла
	

	// Конец демо режимы - выкл всех исполнительных механизмов
	if (demo?.cur >= demo?.total) return safetyOff()
}

module.exports = combi

function safetyOff() {}
