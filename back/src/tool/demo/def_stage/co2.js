const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { getOwnerName } = require('@tool/get/building')
// 10сек
const _delay = 10_000

// Тест разгонных вентиляторов
function co2(bld, obj, m, checklistPNR, demo, permission) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		// console.log(123, 'off', m?.cold?.device?.co2)
		arrCtrlDO(bld._id, m?.cold?.device?.co2, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!m?.cold?.device?.co2?.length) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m?.cold?.device?.co2, 'off')
		return
	}
	// console.log(124, 'on', m?.cold?.device?.co2)
	// Включить
	arrCtrlDO(bld._id, m?.cold?.device?.co2, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, m?.cold?.device?.co2, demo)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, arrCo2, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника
	demo.checklist.co2 ??= {}
	arrCo2.forEach((el) => {
		const v = obj?.value?.[el._id]
		// console.log(11, v, arrCo2)
		demo.checklist.co2.list[el._id] ??= {}
		demo.checklist.co2.list[el._id].name = getOwnerName(el, obj.data, { flt: ['sect'] })
		if (v?.state === 'stop' && !demo.checklist.co2.list[el._id].stop)
			demo.checklist.co2.list[el._id].stop = `ошибка модуля или конфигурации`
	})
}

module.exports = co2
