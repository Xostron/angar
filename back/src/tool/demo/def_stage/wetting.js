const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
// 10сек
const _delay = 10_000

/**
 * Тест одновременное вкл всех увлажнителей
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} mech Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function wetting(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, m.wettingS, 'off')
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет увлажнителей пропускаем данный тест
	if (!m.wettingS) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.wettingS, 'off')
		return
	}
	// Включить все увлажнители
	arrCtrlDO(bld._id, m.wettingS, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, m.wettingS, demo)
}

// Проверка вкл/выкл увлажнители
function check(bld, obj, wettingS, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	wettingS.forEach((el) => {
		const v = obj?.value?.outputEq?.[el._id]
		demo.checklist.wetting.list[el._id] ??= {}
		console.log(123, v)
		// Модуль или Конфигурация
		if (v === false && !demo.checklist.wetting.list[el._id].stop)
			demo.checklist.wetting.list[el._id].stop = 'ошибка модуля или конфигурации'
	})
}

module.exports = wetting
