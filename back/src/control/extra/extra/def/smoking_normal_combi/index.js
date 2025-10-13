const { compareTime, runTime } = require('@tool/command/time')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { arrCtrl } = require('@tool/command/fan/fn')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const { getIdsS } = require('@tool/get/building')
const { fnClear, collect } = require('./fn')
const softStart = require('./soft')
const h = 3600000

/**
 * Окуривание для Обычного и Комби склада:
 * 1 Выключить склад, переключить секции для окуривания в авто
 * 2 Зайти в настройки "Окуривание"
 * 3 Настроить время и в поле "ВКЛЮЧИТЬ" выбрать вкл
 * 4 Дождаться конца окуривания: сообщения о завершении попадают на страницу "СИГНАЛЫ"
 * Работа ВНО: вкл разгонный, работаю секции которые в авто,
 * плавный пуск всех ВНО с регулированием по давлению
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
	// id всех секций данного склада
	const idsS = getIdsS(obj.data.section, idB)
	// Настройки окуривания
	const stg = s?.smoking
	// Аккумулятор окуривания
	const doc = obj.retain?.[idB]?.smoking ?? {}
	store.smoking[idB] = doc
	// Настройка режим работы разгонного вент
	const accelMode = s.coolerCombi?.accel ?? s.accel?.mode
	// Рабочие ВНО по секциям
	const fan = collect(m.fanAll, idB, idsS, obj)
	// Разгонные ВНО
	const fanA = m.fanA ?? []
	// console.log(11, doc, stg, idsS)
	// Выключено окуривание
	if (!stg || !stg?.on) {
		console.log(44, 'Окуривание выключено: Выключение плавного пуска')
		// Если режим разгонных вент. ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrl(idB, fanA, 'off')
		softStart(idB, idsS, fan, obj, s, false)
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
	if (!compareTime(doc.work, stg.work * h)) {
		console.log(22, 'Окуривание работа: Включение плавного пуска')
		arrCtrl(idB, fanA, 'on')
		softStart(idB, idsS, fan, obj, s, true)
		return
	}

	// Выключаем вентиляторы и ждем
	if (!doc.wait) {
		doc.wait = new Date()
		delExtra(idB, null, 'smoking1')
		wrExtra(idB, null, 'smoking2', msgB(building, 82, 'ожидание (этап 2 из 2)'))
	}
	if (!compareTime(doc.wait, stg.wait * h)) {
		arrCtrl(idB, fanA, 'off')
		softStart(idB, idsS, fan, obj, s, false)
		console.log(33, 'Окуривание ожидание: Выключение плавного пуска')
		return
	}

	console.log('Режим окуривания завершен')

	doc.work = null
	doc.wait = null
	delExtra(idB, null, 'smoking1')
	delExtra(idB, null, 'smoking2')
}

module.exports = smoking
