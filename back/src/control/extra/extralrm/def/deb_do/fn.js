const { wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { msgBB } = require('@tool/message')
const { data: store } = require('@store')

/**
 * Функция слежения и генерации аварии дребезга для исполнительных механизмов
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
			ownerName = sect?.name ?? '' + ' ' + clr?.name ?? '' + ':'
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

module.exports = fn
