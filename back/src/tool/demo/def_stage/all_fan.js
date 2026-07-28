const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
// 10сек
const _delay = 10_000

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
function allFan(bld, obj, mech, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		// ВНО используются в нескольких тестах,
		// поэтому тут заглушка для того чтобы тесты с ВНО не влияли друг на друга
		// Активен - Тест одиночного включения ВНО
		if (code == 'fan') return
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
		demo.timeT = new Date()
		arrCtrlDO(bld._id, mech.fanBexc, 'off')
		return
	}
	// Включить все ВНО
	arrCtrlDO(bld._id, mech.fanBexc, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, mech.fanBexc, demo)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, fans, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	fans.forEach((el) => {
		const v = obj?.value?.[el._id]
		demo.checklist.allFan[el._id] = {}
		// Выбит автомат qf: true - автомат выбит, false - ок, null - неисправен модуль
		if (v.qf && !demo.checklist.allFan[el._id].qf)
			demo.checklist.allFan[el._id].qf = 'автомат выбит'
		// Перегрев двигателя heat: true - перегрев, false - ок, null - неисправен модуль
		if (v.heat && !demo.checklist.allFan[el._id].heat)
			demo.checklist.allFan[el._id].heat = 'перегрев мотора'
		// Дребезг контактора
		if (isExtralrm(bld._id, el._id, 'debdo') && !demo.checklist.allFan[el._id].debdo)
			demo.checklist.allFan[el._id].debdo = 'частое включение'
		// Модуль или Конфигурация
		if (v.state == 'stop' && !demo.checklist.allFan[el._id].stop)
			demo.checklist.allFan[el._id].stop = 'ошибка модуля или конфигурации'
		// Превышен ток двигателя
		if (
			v.state == 'run' &&
			v.vai > (+el?.actuator?.current ?? 30) &&
			!demo.checklist.allFan[el._id].vai
		)
			demo.checklist.allFan[el._id].vai = 'превышен ток двигателя'
	})
}

module.exports = allFan
