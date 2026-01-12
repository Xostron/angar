const { compareTime, runTime, remTime } = require('@tool/command/time')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { arrCtrlDO } = require('@tool/command/module_output')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const h = 3600000

/**
 * Окуривание для ХОЛОДИЛЬНИКА:
 * 1 Выключить склад
 * 2 Зайти в настройки "Окуривание"
 * 3 Настроить время и в поле "ВКЛЮЧИТЬ" выбрать вкл
 * 4 Дождаться конца окуривания: сообщения о завершении попадают на страницу "СИГНАЛЫ"
 * @param {*} building
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} alarm
 * @param {*} acc
 * @param {*} data
 * @param {*} ban
 * @param {*} resultFan
 * @param {*} clear
 * @returns
 */
function ozon(
	building,
	section,
	obj,
	s,
	se,
	m,
	alarm,
	acc,
	data,
	ban,
	resultFan,
	clear = false
) {
	const idB = building._id
	if (clear) return fnClear(idB)

	const stg = s?.ozon
	// Все вентиляторы склада
	const arr = collect(m)
	const doc = obj.retain?.[idB]?.ozon ?? {}
	store.ozon[idB] = doc
	const accelMode = s.cooler?.accel ?? s.coolerCombi?.accel ?? s.accel?.mode
	// Выключено окуривание
	if (!stg || !stg?.on) {
		// Если режим разгонных вент. ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrlDO(idB, arr, 'off')
		delete doc.work
		delete doc.wait
		delExtra(idB, null, 'ozon1')
		delExtra(idB, null, 'ozon2')
		return
	}
	// Включено окуривание
	// Работаем - включаются вентиляторы
	doc.work ??= new Date()
	let time = compareTime(doc.work, stg.work * h)

	if (!time) {
		wrExtra(
			idB,
			null,
			'ozon1',
			msgB(building, 91, `Работа ${remTime(doc.work, stg.work * h)}`)
		)
		delExtra(idB, null, 'ozon2')
		arrCtrlDO(idB, arr, 'on')
		return
	}

	// Время работы прошло
	doc.wait ??= new Date()
	delExtra(idB, null, 'ozon1')
	wrExtra(
		idB,
		null,
		'ozon2',
		msgB(building, 91, `Ожидание ${remTime(doc.wait, stg.wait * h)}`)
	)
	arrCtrlDO(idB, arr, 'off')
	time = compareTime(doc.wait, stg.wait * h)
	if (time) {
		doc.work = null
		doc.wait = null
		delExtra(idB, null, 'ozon1')
		delExtra(idB, null, 'ozon2')
	}
}

module.exports = ozon

/**
 * Получить все вентиляторы холодильника
 * @param {object} m Исполнительные механизмы склада
 * @returns
 */
function collect(m) {
	// для холодильника без ПЧ
	const arr = m.fanA ?? []
	m?.cold?.cooler.forEach(({ fan = [] }) => {
		fan ? arr.push(...fan) : null
	})
	return arr
}

function fnClear(idB) {
	delExtra(idB, null, 'ozon')
}
