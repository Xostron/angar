const { arrCtrlDO, ctrlDO, ctrlADO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
const { checklist } = require('../fn/init_data')
// 1сек
const _delay = 1000

/**
 * Тест одновременное вкл всех ВНО
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} mech Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function cinnabons(bld, obj, mech, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		// ВНО используются в нескольких тестах,
		// поэтому тут заглушка для того чтобы тесты с ВНО не влияли друг на друга
		// Активен - Тест одиночного включения ВНО
		if (code == 'fan') return
		// Активен - Тест включения всех ВНО
		if (code == 'allFan') return
		// Активен - Тест испарителей, обычные ВНО отключаем, испарители не трогаем
		if (code == 'coolerCool') return arrCtrlDO(bld._id, mech.fanBN, 'off')
		// Активен - другие тесты
		arrCtrlDO(bld._id, mech.fanBexc, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет ВНО пропускаем данный тест
	if (!mech.fanBexc) {
		demo.order++
		arrCtrlDO(bld._id, mech.fanBexc, 'off')
		return
	}

	ctrl(bld, obj, mech.fanBexc, demo)
	console.log(123, demo.cinnabons)
}

function ctrl(bld, obj, fans, demo) {
	demo.cinnabons ??= {}
	demo.cinnabons.t1 ??= new Date()
	demo.cinnabons.count ??= 1
	const r1 = fans[0]
	const r2 = fans[1]
	const r3 = fans[2]

	const t1 = compareTime(demo.cinnabons.t1, _delay)
	// Время прошло
	if (t1) {
		ctrlDO(r1, bld._id, 'off')
		if (demo.cinnabons.count == 2) {
			demo.cinnabons.t1 = new Date()
		}
	}
	if (demo.cinnabons.count == 2) {
		demo.cinnabons.count = 1
		demo.cinnabons.t1 = new Date()
		ctrlDO(r2, bld._id, 'on')
		ctrlDO(r3, bld._id, 'on')
		return
	}
	// Время не прошло
	ctrlDO(r1, bld._id, 'on')
	ctrlDO(r2, bld._id, 'off')
		ctrlDO(r3, bld._id, 'off')
	demo.cinnabons.count = 2
}

module.exports = cinnabons
