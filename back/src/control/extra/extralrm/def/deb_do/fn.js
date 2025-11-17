const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')
const { msgBB } = require('@tool/message')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')

/**
 * Функция слежения и генерации аварии дребезга для исполнительных механизмов
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function set(bld, arr, obj, accDeb, acc, watch, count) {
	if (!obj?.value?.outputEq || !count || !watch) return
	arr.forEach((el) => {
		accDeb[el._id] ??= []
		acc[el._id] ??= {}
		// Данный механизм уже в аварии
		if (acc?.[el._id]?.alarm) return
		// Владелец механизма
		const ownerName = fnOwner(el, obj)
		// Текущее, предыдущее состояние
		const cur = obj?.value?.outputEq?.[el._id]
		const last = accDeb[el._id].at(-1)

		// Фиксируем изменение состояния
		if (last?.DO !== cur && typeof cur === 'boolean')
			accDeb[el._id].push({ DO: cur, date: new Date() })
		// Размер очереди превышен
		if (accDeb[el._id].length > count) accDeb[el._id].shift()

		// Очередь не заполнена - выходим
		if (accDeb[el._id].length < count) return

		const delta = accDeb[el._id].at(-1).date - accDeb[el._id][0].date

		// Время между последними состояниями больше порога дребезга -> ОК
		if (delta > watch) return

		// Время меньше порога -> установка аварии
		wrExtralrm(bld._id, 'debdo', el._id, msgBB(bld, 102, ownerName, el.name))
		acc._alarm = true
		acc[el._id].alarm = true
		acc.flag = true
	})
}

// Определяем владельцев ВНО
function fnOwner(el, obj) {
	const idS = el?.owner.type === 'section' ? el?.owner?.id : null
	const clrId = el?.owner.type === 'cooler' ? el?.owner?.id : null
	let ownerName = ''
	if (idS) ownerName = obj?.data?.section?.find((sec) => sec._id === idS)?.name
	if (clrId) {
		const clr = obj?.data?.cooler?.find((cl) => cl._id === clrId)
		const sect = obj?.data?.section?.find((sec) => sec._id === clr.sectionId)
		ownerName = sect?.name ?? '' + ' ' + clr?.name ?? '' + ':'
	}
}

/**
 * Разрешение на работу
 * @param {*} bld
 * @param {*} watch
 * @param {*} count
 * @param {*} wait
 * @param {*} acc
 * @returns {boolean} true разрешить, false - очистить аккумулятор и запретить
 */
function fnCheck(bld, watch, count, wait, arr, acc, accDeb) {
	// Очищаем аккумулятор и игнорируем слежение:
	// 1. Нет настроек
	if (!watch || !count || count < 3 || !wait) {
		fnReset(bld, arr, acc, accDeb)
		return false
	}
	return true
}

// Cброс аварии
function reset(bld, wait, arr, acc, accDeb) {
	if (acc._alarm && !acc.wait) acc.wait = new Date()
	// Время автосброса аварии закончилось или нажали на кнопку
	const waitCom = compareTime(acc.wait, wait)
	if (waitCom || (acc.flag && !acc._alarm)) fnReset(bld, arr, acc, accDeb)
}

function fnReset(bld, arr, acc, accDeb) {
	delExtralrm(bld._id, null, 'debdo')
	acc._alarm = false
	delete acc.wait
	delete acc.flag
	// При сбросе аварийного сообщения, очищаем аккумулятор данного ВНО
	arr.forEach((el) => {
		if (acc[el._id]?.alarm && !acc._alarm) {
			delete acc?.[el._id]?.alarm
			accDeb[el._id] = []
		}
	})
}

module.exports = { set, reset, fnCheck }
