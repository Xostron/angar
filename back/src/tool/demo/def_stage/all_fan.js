const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
// 10сек
const _delay = 10_000

// Тест одновременное вкл всех ВНО
function allFan(bld, obj, mech, demo, permission) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, mech.fanBexc, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!mech.fanBexc) {
		demo.order++
		arrCtrlDO(bld._id, mech.fanBexc, 'off')
		return
	}
	// Включить
	arrCtrlDO(bld._id, mech.fanBexc, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, mech.fanBexc, demo)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, fan, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	fan.forEach((el) => {
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
		// Конфигурация
		if (v.state == 'stop' && !demo.checklist.allFan[el._id].stop)
			demo.checklist.allFan[el._id].stop = 'ошибка в конфигурации'
	})
}

module.exports = allFan
