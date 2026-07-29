const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
// 10сек
const _delay = 10_000

/**
 * Тест одновременное вкл всех подогревов клапанов
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} mech Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function heat(bld, obj, mech, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, mech.heatingAll, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет ВНО пропускаем данный тест
	if (!mech.heatingAll) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, mech.heatingAll, 'off')
		return
	}
	// Включить все ВНО
	arrCtrlDO(bld._id, mech.heatingAll, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, mech.heatingAll, demo)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, heat, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	heat.forEach((el) => {
		const v = obj?.value?.outputEq?.[el._id]
		demo.checklist.heat[el._id] ??= {}
		// Модуль или Конфигурация
		if (v===false && !demo.checklist.heat[el._id].stop)
			demo.checklist.heat[el._id].stop = 'ошибка модуля или конфигурации'
	})
}

module.exports = heat
