const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { getOwnerName } = require('@tool/get/building')
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
function heat(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, m.heatingAll, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет ВНО пропускаем данный тест
	if (!m.heatingAll?.length) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.heatingAll, 'off')
		return
	}
	// Включить все ВНО
	arrCtrlDO(bld._id, m.heatingAll, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, m.heatingAll, demo)
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
		demo.checklist.heat.list[el._id] ??= {}
		demo.checklist.heat.list[el._id].name = getOwnerName(el, obj.data, {
			flt: ['sect'],
		})
		// Модуль или Конфигурация
		if (v === false && !demo.checklist.heat.list[el._id].stop)
			demo.checklist.heat.list[el._id].stop = 'ошибка модуля или конфигурации'
	})
}

module.exports = heat
