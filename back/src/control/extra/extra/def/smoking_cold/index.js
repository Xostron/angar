const { compareTime, runTime } = require('@tool/command/time')
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
	const idB = building._id
	if (clear) return fnClear(idB)

	const stg = s?.smoking
	// Все вентиляторы склада
	const arr = collect(m)
	const doc = obj.retain?.[idB]?.smoking ?? {}
	store.smoking[idB] = doc
	const accelMode = s.cooler?.accel ?? s.coolerCombi?.accel ?? s.accel?.mode
	// Выключено окуривание
	if (!stg || !stg?.on) {
		// Если режим разгонных вент. ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrlDO(idB, arr, 'off')
		delete doc.work
		delete doc.wait
		delExtra(idB, null, 'smoking1')
		delExtra(idB, null, 'smoking2')
		return
	}
	// Включено окуривание
	console.log('Режим окуривания', runTime(doc.wait ?? doc.work))

	// Работаем - включаются вентиляторы
	if (!doc.work) {
		doc.work = new Date()
		wrExtra(idB, null, 'smoking1', msgB(building, 82, 'работа (этап 1 из 2)'))
	}
	// Повтор сообщения, если наш пос ребутнулся ночью аккурат находясь в окуривании
	if (doc.work && !doc.wait && !isExtra(idB, null, 'smoking1'))
		wrExtra(idB, null, 'smoking1', msgB(building, 82, 'работа (этап 1 из 2)'))

	if (!compareTime(doc.work, stg.work * h)) {
		arrCtrlDO(idB, arr, 'on')
		return
	}

	// Выключаем вентиляторы и ждем
	if (!doc.wait) {
		doc.wait = new Date()
		delExtra(idB, null, 'smoking1')
		wrExtra(idB, null, 'smoking2', msgB(building, 82, 'ожидание (этап 2 из 2)'))
	}
	// Повтор сообщения, если наш пос ребутнулся ночью аккурат находясь в окуривании
	if (doc.wait && !isExtra(idB, null, 'smoking2'))
		wrExtra(idB, null, 'smoking2', msgB(building, 82, 'ожидание (этап 2 из 2)'))
	if (!compareTime(doc.wait, stg.wait * h)) {
		arrCtrlDO(idB, arr, 'off')
		return
	}

	console.log('Режим окуривания завершен')

	doc.work = null
	doc.wait = null
	delExtra(idB, null, 'smoking1')
	delExtra(idB, null, 'smoking2')
}

module.exports = smoking

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
	delExtra(idB, null, 'smoking')
}
