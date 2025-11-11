const { msg } = require('@tool/message')
const { curStateV } = require('@tool/command/valve')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')

function set(bld, sect, value, vlvS, acc, s) {
	// Уже в аварии - выходим из итерации
	if (acc._alarm) return
	// Размер очереди для фиксации состояний клапана
	const count = (s.antibliz.count ?? 0) * 2
	// ['cls', 'other','cls', 'other','cls]
	acc.queue ??= []
	// Состояние приточного клапана
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	const state = curStateV(vlvIn._id, value) === 'cls' ? 'cls' : 'other'

	// Логика
	// Фиксируем состояние клапана в очереди
	if (acc.queue.at(-1)?.state !== state) acc.queue.push({ state, date: new Date() })
	// Размер очереди превышен -> удаляем первый элемент
	if (acc.queue.length > count) {
		acc.queue.shift()
	}
	// Из очереди отфильтровываем только состояния "клапан закрыт"
	const onlyCls = acc.queue.filter((el) => el.state === 'cls')
	// Очередь не заполнена - выходим
	if (onlyCls.length < s.antibliz.count) return
	// Очередь заполнена -> проверяем время
	const delta = onlyCls.at(-1).date - onlyCls[0].date
	// Время между последними состояниями больше  -> Авария false
	if (delta > s.antibliz.time) return
	//Время меньше порога -> Авария true
	wrExtralrm(bld._id, sect._id, 'antibliz', msg(bld, sect, 13))
	acc._alarm = true
}

// Автосброс аварии
function reset(bld, sect, s, acc) {
	if (acc._alarm && !acc?.wait) {
		acc.wait = new Date()
		acc.flag = true
	}
	// Был сброс аварии
	if (acc.flag && !acc._alarm) fnReset(bld, sect, acc)

	// Время автосброса аварии закончилось
	const wait = compareTime(acc?.wait, s.antibliz.wait)
	if (wait) fnReset(bld, sect, acc)
}

function fnReset(bld, sect, acc) {
	delExtralrm(bld._id, sect._id, 'antibliz')
	acc.queue = []
	delete acc.wait
	delete acc.flag
	delete acc._alarm
}

/**
 * Разрешение на работу
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} m
 * @param {*} s
 * @param {*} acc
 * @returns {boolean} true разрешить, false - очистить аккумулятор и запретить
 */
function fnCheck(bld, sect, obj, m, s, acc) {
	// Очищаем аккумулятор и игнорируем слежение:
	// 1. Склад выключен
	// 3. Секция не в авто
	// 2. Нет приточных клапанов
	// 4. Нет настроек
	// 5. Режим антивьюги Выкл
	const vlvIn = m.vlvS.find((vlv) => vlv.type === 'in')
	if (
		!obj.retain[bld._id].start ||
		!obj.retain[bld._id].mode?.[sect._id] ||
		!vlvIn ||
		!s.antibliz.count ||
		!s.antibliz.time ||
		!s.antibliz.wait ||
		!s?.antibliz?.mode ||
		s.antibliz.mode === 'off'
	) {
		fnReset(bld, sect, acc)
		return false
	}
	return true
}

module.exports = { set, reset, fnReset, fnCheck }
