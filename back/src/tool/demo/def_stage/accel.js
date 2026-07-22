const { ctrlDO } = require('@tool/command/module_output')
const { checklist } = require('../fn/init_data')
const { compareTime } = require('@tool/command/time')
// 10сек
const _delay = 10_000

function accel(bld, obj, mech, demo) {
	// Если нет разгонников пропускаем данный тест
	if (!mech.fanA) {
		demo.order++
		return
	}

	// Контроль времени
	const t = compareTime(demo.timeT, checklist[demo.order].last)
	// Время теста прошло - переключаем на следующий
	if (t) {
		demo.order++
		// Время теста
		demo.timeT = new Date()
		// Выключить
		mech.fanA.forEach((el) => {
			ctrlDO(el, bld._id, 'off')
		})
		return
	}

	// Включить
	mech.fanA.forEach((el) => {
		ctrlDO(el, bld._id, 'on')
	})

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
		const v = obj.value[el._id]
		if (v.state === 'stop' && !demo.checklist.accel[el._id])
			demo.checklist.accel[el._id] = `Не активен разгонный вентилятор ${el.name}`
		console.log(123, obj.value[el._id])
	})
}

module.exports = accel
