const { arrCtrlDO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')

// 10сек
const _delay = 10_000

/**
 * Тест одновременное вкл всех увлажнителей
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} m Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function coolerFlap(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, m.flapB, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет увлажнителей пропускаем данный тест
	if (!m.flapB?.length) {
		demo.order++
		demo.timeT = new Date()
		return
	}
	// Включить все испарители
	arrCtrlDO(bld._id, m.flapB, 'on')
	check(bld, obj, m.flapB, demo)
}

// Проверка вкл/выкл разгонник
// Проверка вкл/выкл разгонник
function check(bld, obj, flap, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	flap.forEach((el) => {
		const v = obj?.value?.outputEq?.[el._id]
		demo.checklist.coolerFlap.list[el._id] ??= {}
		// Модуль или Конфигурация
		if (v === false && !demo.checklist.flap.list[el._id].stop)
			demo.checklist.flap.list[el._id].stop = 'ошибка модуля или конфигурации'
	})
}

module.exports = coolerFlap
