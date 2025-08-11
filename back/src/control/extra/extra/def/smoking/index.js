const { compareTime, runTime } = require('@tool/command/time')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { arrCtrl } = require('@tool/command/fan/fn')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')

// const h = 60000
const h = 3600000
// Окуривание
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

	const state = s?.smoking
	const arr = collect(m)
	const buildingId = building._id
	const doc = obj.retain?.[buildingId]?.smoking ?? {}
	store.smoking[buildingId] = doc
	const stg = s.cooler ?? s.coolerCombi
	// Выключено окуривание
	if (!state || !state?.on) {
		// Если режим разгонных вент. ВКЛ - то блокируем выключение
		if (stg.accel !== 'on') arrCtrl(building._id, arr, 'off')
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
	if (!compareTime(doc.work, state.work * h)) {
		arrCtrl(building._id, arr, 'on')
		return
	}

	// Выключаем вентиляторы и ждем
	if (!doc.wait) {
		doc.wait = new Date()
		wrExtra(building._id, null, 'smoking', msgB(building, 82, ' ожидание'))
	}
	if (!compareTime(doc.wait, state.wait * h)) {
		arrCtrl(building._id, arr, 'off')
		return
	}

	console.log('Режим окуривания завершен')

	doc.work = null
	doc.wait = null
}

module.exports = smoking

// Получить все вентиляторы холодильника
function collect(m) {
	const arr = m.fanA ?? []
	m.cold.cooler.forEach(({ fan = [] }) => {
		fan ? arr.push(...fan) : null
	})
	return arr
}

function fnClear(idB) {
	delExtra(idB, null, 'smoking')
}
