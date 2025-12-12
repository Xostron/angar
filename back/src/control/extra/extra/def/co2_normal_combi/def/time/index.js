const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')
const { checkNow } = require('./check')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnTime(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	delExtra(bld._id, null, 'co2', 'on')
	acc.byTime ??= {}
	// Ожидание
	acc.byTime.wait ??= new Date()
	acc.byTime.stgWait = s.co2?.wait?.w
	let time = compareTime(acc.byTime.wait, acc.byTime.stgWait)
	// 1. Время ожидание не прошло
	if (!time) {
		wrExtra(
			bld._id,
			null,
			'co2',
			msgB(bld, 85, `${remTime(acc.byTime.wait, acc.byTime.stgWait)}`),
			'wait'
		)
		delExtra(bld._id, null, 'co2', 'work')
		return
	}
	// 2. Время ожидания прошло -> Проверка условий по датчикам
	if (!checkNow(bld, prepare, s)) {
		// Проверка не пройдена
		delExtra(bld._id, null, 'co2', 'work')
		// 1. Условия не подходят по окончанию ожидания (продолжаем ждать)
		if (!acc.byTime.work) return
		// 2. Условия не подходят во время работы (начинаем цикл заново)
		acc.byTime = {}
		return
	}

	// Время ожидания прошло. Проверка условий пройдена. Работа
	acc.byTime.work ??= new Date()
	delExtra(bld._id, null, 'co2', 'wait')
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, `${remTime(acc.byTime.work, s.co2.work)}`), 'work')
	//
	resultFan.force.push(true)
	resultFan.stg.push('co2')
	//
	time = compareTime(acc.byTime.work, s.co2.work)
	//
	if (time) {
		acc.byTime = {}
		delExtra(bld._id, null, 'co2', 'work')
		// Если нет времени ожидания, удаление СО2 будет всегда в работе
		// для безударнорго перехода
		if (acc.byTime.stgWait) return
		// Время работы прошло
		resultFan.force.push(false)
		resultFan.stg.push(null)
	}
}

module.exports = fnTime
