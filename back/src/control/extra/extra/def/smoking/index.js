const { compareTime, runTime } = require('@tool/command/time')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { arrCtrl } = require('@tool/command/fan/fn')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')

// const h = 60000
const h = 3600000
/**
 * Окуривание:
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
function smoking(
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
	if (clear) return fnClear(building._id)

	const stg = s?.smoking
	// Все вентиляторы склада
	const arr = collect(m)
	const bId = building._id
	const doc = obj.retain?.[bId]?.smoking ?? {}
	store.smoking[bId] = doc
	const accelMode = s.cooler?.accel ?? s.coolerCombi?.accel ?? s.accel?.mode
	console.log(1, doc, stg)
	// Выключено окуривание
	if (!stg || !stg?.on) {
		// Если режим разгонных вент. ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrl(building._id, arr, 'off')
		delete doc.work
		delete doc.wait
		delExtra(building._id, null, 'smoking')
		return
	}
	// Включено окуривание
	console.log('Режим окуривания', runTime(doc.wait ?? doc.work))

	// Работаем - включаются вентиляторы
	if (!doc.work) {
		doc.work = new Date()
		wrExtra(building._id, null, 'smoking', msgB(building, 82, ' работа'))
	}
	if (!compareTime(doc.work, stg.work * h)) {
		arrCtrl(building._id, arr, 'on')
		return
	}

	// Выключаем вентиляторы и ждем
	if (!doc.wait) {
		doc.wait = new Date()
		wrExtra(building._id, null, 'smoking', msgB(building, 82, ' ожидание'))
	}
	if (!compareTime(doc.wait, stg.wait * h)) {
		arrCtrl(building._id, arr, 'off')
		return
	}

	console.log('Режим окуривания завершен')

	doc.work = null
	doc.wait = null
}

module.exports = smoking

/**
 * Получить все вентиляторы холодильника
 * @param {object} m Исполнительные механизмы склада
 * @returns
 */
function collect(m) {
	// console.log(2,m)
	const arr = m.fanA ?? []
	m?.cold?.cooler.forEach(({ fan = [] }) => {
		fan ? arr.push(...fan) : null
	})
	// TODO для любых складов

	return m.fanAll
}

function fnClear(idB) {
	delExtra(idB, null, 'smoking')
}
