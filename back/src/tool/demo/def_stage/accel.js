const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
// 10сек
const _delay = 10_000

// Тест разгонных вентиляторов
function accel(bld, obj, m, checklistPNR, demo, permission) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, m.fanA, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!m.fanA) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.fanA, 'off')
		return
	}

	// Включить
	arrCtrlDO(bld._id, m.fanA, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, m.fanA, demo)
}

// Проверка вкл/выкл разгонник
function check(bld, obj, fanA, demo) {
	// Начинаем проверку с задержкой, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	fanA.forEach((el) => {
		const v = obj?.value?.[el._id]
		demo.checklist.accel.list[el._id] ??= {}
		if (v?.state === 'stop' && !demo.checklist.accel.list[el._id].stop)
			demo.checklist.accel.list[el._id].stop = `ошибка модуля или конфигурации`
	})
}

module.exports = accel
