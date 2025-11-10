const { data: store } = require('@store')
const { msgBB } = require('@tool/message')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const { isReset } = require('@tool/reset')

/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel), клапаны (in,out), подогрев клапанов (heating),
 * оттайка испарителя(cooler), обогрев слива воды(water)
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} automode
 * @param {*} acc
 * @param {*} data
 * @returns
 */
function debounce(bld, sect, obj, s, se, m, automode, acc, data) {
	const watch = (s?.sys?.debDO ?? 20) * 1000
	const count = s?.sys?.debCount ?? 4
	const dflWait = 30 * 60 * 1000 // 30 мин
	// напорные ВНО канала + разгонные
	fn(bld, m.fanAll, obj, store.debounce, acc, watch, count)
	// Время автосброса аварии
	if (acc._alarm && !acc.wait) acc.wait = new Date()
	const wait = s?.sys?.debWait === 0 ? false : compareTime(acc.wait, s?.sys?.debWait ?? dflWait)
	// Сброс аварии:
	// 1. Системные настройки (кол-во переключений, время подсчета) равны нулю,
	// 2. Время автосброса истекло,
	if (!watch || !count || wait) {
		// Сброс аварийных сообщений
		delExtralrm(bld._id, null, 'debounce')
		acc._alarm = false
		acc.wait = null
	}
	// console.log(66,  'wait=', wait)
	return acc?._alarm ?? false
}

module.exports = debounce

/**
 * Функция слежения и генерации аварии дребезга
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function fn(bld, arr, obj, accDeb, acc, watch, count) {
	if (!obj?.value?.outputEq || !count || !watch) return
	arr.forEach((el) => {
		accDeb[el._id] ??= []
		acc[el._id] ??= {}
		// Определяем владельцев ВНО
		const idS = el?.owner.type === 'section' ? el?.owner?.id : null
		const sect = obj?.data?.section?.find((sec) => sec._id === idS)
		const clrId = el?.owner.type === 'cooler' ? el?.owner?.id : null
		const cur = obj?.value?.outputEq?.[el._id]
		const last = accDeb[el._id].at(-1)
		// Есть ли авария по текущему ВНО
		const isAlr = isExtralrm(bld._id, 'debounce', el._id)
		// Уже в аварии - выходим из итерации
		if (isAlr) return

		if (el.type === 'accel') console.log(3, el._id, cur, last?.DO, last?.DO !== cur)

		// При сбросе аварийного сообщения, очищаем аккумулятор данного ВНО
		if (acc[el._id]?.alarm && !isAlr) {
			delete acc?.[el._id]?.alarm
			accDeb[el._id] = []
		}

		// Фиксируем изменение состояния
		if (last?.DO !== cur) accDeb[el._id].push({ DO: cur, date: new Date() })
		// Размер очереди превышен
		if (accDeb[el._id].length > count) accDeb[el._id].shift()

		// Очередь не заполнена - выходим
		if (accDeb[el._id].length < count) return

		const delta = accDeb[el._id].at(-1).date - accDeb[el._id][0].date
		// Время между последними состояниями больше порога дребезга -> ОК
		if (delta > watch) return
		// Время меньше порога -> установка аварии
		const mesBeg = sect?.name ? bld.name + '. ' + sect?.name + '. ' : bld.name + '. '
		wrExtralrm(bld._id, 'debounce', el._id, msgBB(bld, 102, mesBeg, el.name))
		acc._alarm = true
		acc[el._id].alarm = true
	})
}
