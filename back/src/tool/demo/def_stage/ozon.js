const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
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
function ozon(bld, obj, mech, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, mech.ozon, 'off')
		return
	}
	// console.log(11, mech.ozon)
	// АКТИВЕН - Текущий тест
	// Если нет увлажнителей пропускаем данный тест
	if (!mech.ozon) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, mech.ozon, 'off')
		return
	}
	// Включить все увлажнители
	arrCtrlDO(bld._id, mech.ozon, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, mech.ozon, demo)
}

// Проверка вкл/выкл увлажнители
function check(bld, obj, oz, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	oz.forEach((el) => {
		const v = obj?.value?.[el._id]
		demo.checklist.ozon[el._id] = {}
		// beep Выключен автомат
		if (isExtralrm(bld._id, null, 'ozon3') && !demo.checklist.ozon[el._id].beep)
			demo.checklist.ozon[el._id].beep = 'выключен автомат'

		// Модуль или Конфигурация
		if (v?.state == 'stop' && !demo.checklist.ozon[el._id].stop)
			demo.checklist.ozon[el._id].stop = 'ошибка модуля или конфигурации'
	})
}

module.exports = ozon
