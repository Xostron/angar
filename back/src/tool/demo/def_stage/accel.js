const {  arrCtrlDO } = require('@tool/command/module_output')
const { checklist } = require('../fn/init_data')
const { compareTime } = require('@tool/command/time')
// 10сек
const _delay = 10_000

// Тест разгонных вентиляторов
function accel(bld, obj, mech, demo, permission) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		arrCtrlDO(bld._id, mech.fanA, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!mech.fanA) {
		demo.order++
		arrCtrlDO(bld._id, mech.fanA, 'off')
		return
	}

	// Включить
	arrCtrlDO(bld._id, mech.fanA, 'on')
	// Проверка и запись неисправностей в журнал
	check(bld, obj, mech.fanA, demo)
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
		if (v?.state === 'stop' && !demo.checklist.accel[el._id])
			demo.checklist.accel[el._id] = `Не активен разгонный вентилятор ${el.name}`
	})
}

module.exports = accel
