const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')
const { arrCtrlDO } = require('@tool/command/module_output')
const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const soft = require('@tool/smoking_ozon/soft')
const { fnClear, collect } = require('@tool/smoking_ozon/fn')
const getOzon = require('./fn')
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
function ozon(building, section, obj, s, se, m, alarm, acc, data, ban, resultFan, clear = false) {
	const idB = building._id
	if (clear) return fnClear(idB, 'ozon')
	// id всех секций данного склада
	const idsS = getIdsS(obj.data.section, idB)
	// Настройки окуривания
	const stg = s?.ozon
	// Аккумулятор окуривания
	const doc = obj.retain?.[idB]?.ozon ?? {}
	store.ozon[idB] = doc
	// Настройка режим работы разгонного вент
	const accelMode = s.coolerCombi?.accel ?? s.accel?.mode
	// Рабочие ВНО по секциям
	const fan = collect(idB, idsS, obj, stg)
	// Разгонные ВНО
	const fanA = m.fanA ?? []
	// Устройства озонаторы
	// Готовность работы озонаторов (есть ли хотя бы один рабочий озонатор)
	const oz = getOzon(building, obj, m)
	// Если Окуривание еще не в работе И озонатор не готов, то выключаем озонатор
	if ((!oz.ready && !doc.work && stg?.on) || s?.smoking?.on) {
		store.retain[building._id].setting ??= {}
		store.retain[building._id].setting.ozon ??= {}
		store.retain[building._id].setting.ozon.on = false
		delete doc.work
		delete doc.wait
		delete store?.heap?.ozon
		delExtra(idB, null, 'ozon1')
		delExtra(idB, null, 'ozon2')
		arrCtrlDO(idB, oz.arr, 'off')
		return
	}
	console.log(11, 'Озонатор', doc, stg, idsS, oz?.arr?.length, oz?.ready)

	// Запрет озонатора: нет настроек, озонация выкл, склад вкл, работает окуривание
	// if (s?.smoking?.on) return
	if (!stg || !stg?.on) {
		// console.log('\t', 44, 'Окуривание выключено: Выключение плавного пуска')
		// Если режим разгонных ВНО не ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrlDO(idB, fanA, 'off')
		soft(idB, idsS, fan, obj, s, false)
		arrCtrlDO(idB, oz.arr, 'off')
		delete doc.work
		delete doc.wait
		delete store?.heap?.ozon
		delExtra(idB, null, 'ozon1')
		delExtra(idB, null, 'ozon2')
		return
	}

	// Включено окуривание
	delExtra(idB, null, 'ozon3')
	// console.log('Режим окуривания', runTime(doc.wait ?? doc.work))

	// Работаем - включаются вентиляторы
	doc.work ??= new Date()
	let time = compareTime(doc.work, stg.work * h)
	// Время работы не прошло И озонатор готов => Работа
	if (!time && oz.ready) {
		wrExtra(idB, null, 'ozon1', msgB(building, 91, `Работа ${remTime(doc.work, stg.work * h)}`))
		delExtra(idB, null, 'ozon2')
		// Вкл разгонные
		arrCtrlDO(idB, fanA, 'on')
		arrCtrlDO(idB, oz.arr, 'on')
		// Вкл ВНО секции
		soft(idB, idsS, fan, obj, s, true, 'ozon')
		delete doc?.wait
		return
	}
	// Время работы прошло ИЛИ озонатор неисправен
	doc.wait ??= new Date()
	delExtra(idB, null, 'ozon1')
	wrExtra(idB, null, 'ozon2', msgB(building, 91, `Ожидание ${remTime(doc.wait, stg.wait * h)}`))
	arrCtrlDO(idB, fanA, 'off')
	arrCtrlDO(idB, oz.arr, 'off')
	soft(idB, idsS, fan, obj, s, false, 'ozon')

	time = compareTime(doc.wait, stg.wait * h)
	// Время ожидания прошло
	if (time) {
		doc.work = null
		doc.wait = null
		// Удаляем аккумулятор плавного пуска по завершению окуривания
		delete store?.heap?.ozon
		delExtra(idB, null, 'ozon1')
		delExtra(idB, null, 'ozon2')
	}
}

module.exports = ozon

function clear(idB, doc, mod = null) {
	delete store?.heap?.ozon
	delExtra(idB, null, 'ozon1')
	delExtra(idB, null, 'ozon2')
	if (mod === null) {
		doc.work = null
		doc.wait = null
		return
	}
	delete doc.work
	delete doc.wait
}
