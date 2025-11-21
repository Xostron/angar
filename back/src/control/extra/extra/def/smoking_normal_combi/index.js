const { compareTime, runTime } = require('@tool/command/time')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { arrCtrl } = require('@tool/command/fan/fn')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const { getIdsS } = require('@tool/get/building')
const { fnClear, collect } = require('./fn')
const soft = require('./soft')
const h = 3600000

/**
 * Окуривание для Обычного и Комби склада:
 * 1 ВЫКЛЮЧИТЬ склад, переключить секции для окуривания в АВТО!!!
 * (если секции будут в ручном или выключены, ВНО не включатся)
 * 2 Зайти в настройки "Окуривание": Настроить время окуривания,
 * в поле "ВКЛЮЧИТЬ" выбрать ВКЛ -> Сохранить настройки -> Окуривание включено
 * 3. Окуривание в работе (1 этап из 2) - это работают ВНО
 * 4. По истечению времени работы окуривания -> выкл ВНО
 * 5. Появляется сообщение "Окуривание ожидание (2 этап из 2)"
 * 6. Время ожидания истекло: Склад включается и начинает работать в авторежиме
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
	const fan = collect(idB, idsS, obj, stg)
	// Разгонные ВНО
	const fanA = m.fanA ?? []
	console.log(11, 'ОКУРИВАНИЕ', doc, stg, idsS)
	// Запрет окуривания: нет настроек окуривания, окуривание выкл, склад вкл,
	if (!stg || !stg?.on) {
		console.log('\t', 44, 'Окуривание выключено: Выключение плавного пуска')
		// Если режим разгонных ВНО не ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrl(idB, fanA, 'off')
		soft(idB, idsS, fan, obj, s, false)
		delete doc.work
		delete doc.wait
		// Удаляем аккумулятор плавного пуска по завершению окуривания
		delete store?.heap?.smoking
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
		console.log(22, 'Окуривание работа: Включение плавного пуска')
		// Вкл разгонные
		arrCtrl(idB, fanA, 'on')
		// Вкл ВНО секции
		soft(idB, idsS, fan, obj, s, true)
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
		arrCtrl(idB, fanA, 'off')
		soft(idB, idsS, fan, obj, s, false)
		console.log(33, 'Окуривание ожидание: Выключение плавного пуска')
		return
	}

	console.log('Режим окуривания завершен')
	doc.work = null
	doc.wait = null
	// Удаляем аккумулятор плавного пуска по завершению окуривания
	delete store?.heap?.smoking
	delExtra(idB, null, 'smoking1')
	delExtra(idB, null, 'smoking2')
}

module.exports = smoking
