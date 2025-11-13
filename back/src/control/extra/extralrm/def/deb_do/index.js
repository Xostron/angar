const { data: store } = require('@store')
const { msgBB } = require('@tool/message')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')

/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel, cooler), клапаны (in,out), подогрев клапанов (heating),
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
function debdo(bld, sect, obj, s, se, m, automode, acc, data) {
	const watch = (s?.sys?.debDO ?? s?.cooler?.debDO ?? 20) * 1000
	const count = s?.sys?.debCount ?? s?.cooler?.debCount ?? 4
	const wait = s?.sys?.debWait ?? s?.cooler?.debWait ?? 30 * 60 * 1000 // 30 мин

	console.log(44, 'Частое вкл ВНО debdo', acc)
	// напорные ВНО канала + разгонные
	fn(bld, m.fanAll, obj, store.debounce, acc, watch, count)
	// Время автосброса аварии
	if (acc._alarm && !acc.wait) acc.wait = new Date()
	const waitCom = compareTime(acc.wait, wait)
	// Сброс аварии:
	// 1. Системные настройки (кол-во переключений, время подсчета) равны нулю,
	// 2. Время автосброса истекло,
	if (!watch || !count || waitCom) {
		// Сброс аварийных сообщений
		delExtralrm(bld._id, null, 'debdo')
		acc._alarm = false
		delete acc.wait 
	}
	// console.log(66,  'wait=', wait)
	return acc?._alarm ?? false
}

module.exports = debdo

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
		const clrId = el?.owner.type === 'cooler' ? el?.owner?.id : null
		let ownerName = ''
		if (idS) ownerName = obj?.data?.section?.find((sec) => sec._id === idS)?.name
		if (clrId) {
			const clr = obj?.data?.cooler?.find((cl) => cl._id === clrId)
			const sect = obj?.data?.section?.find((sec) => sec._id === clr.sectionId)
			ownerName = sect?.name ?? '' + ' ' + clr?.name ?? ''+':'
		}

		const cur = obj?.value?.outputEq?.[el._id]
		const last = accDeb[el._id].at(-1)
		// Есть ли авария по текущему ВНО
		const isAlr = isExtralrm(bld._id, 'debdo', el._id)
		// Уже в аварии - выходим из итерации
		if (isAlr) return

		// При сбросе аварийного сообщения, очищаем аккумулятор данного ВНО
		if (acc[el._id]?.alarm && !isAlr) {
			delete acc?.[el._id]?.alarm
			delete acc.wait
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
		
		wrExtralrm(bld._id, 'debdo', el._id, msgBB(bld, 102, ownerName, el.name))
		acc._alarm = true
		acc[el._id].alarm = true
	})
}
