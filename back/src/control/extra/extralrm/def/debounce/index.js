const { data: store } = require('@store')
const { msgBB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
// Кол-во замеров
const _LEN = 4

/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel), клапаны (in,out), подогрев клапанов (heating),
 * оттайка испарителя(cooler), обогрев слива воды(water)
 * @param {*} building
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} automode
 * @param {*} acc
 * @param {*} data
 * @returns
 */
function debounce(building, section, obj, s, se, m, automode, acc, data) {
	// напорные ВНО канала + разгонные
	fn(building, m.fanAll, obj, s, store.debounce, acc)

	// Сброс аварийных сообщений
	if (isReset(building._id)) {
		delExtralrm(building._id, null, 'debounce')
		acc.alarm = false
	}
	console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', acc.alarm)
	return acc?.alarm ?? false
}

module.exports = debounce

/**
 *
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function fn(bld, arr, obj, s, accDeb, acc) {
	if (!obj?.value?.outputEq) return
	const threshold = (s.sys.debDO ?? 20) * 1000
	arr.forEach((el) => {
		accDeb[el._id] ??= []
		acc[el._id] ??= {}
		const idS = el?.owner.type === 'section' ? el?.owner?.id : null
		const sect = obj?.data?.section?.find((sec) => sec._id === idS)
		const clrId = el?.owner.type === 'cooler' ? el?.owner?.id : null
		const cur = obj?.value?.outputEq?.[el._id]
		const last = accDeb[el._id].at(-1)
		const isAlr = isExtralrm(bld._id, 'debounce', el._id)
		console.log(2, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@', el.name, accDeb[el._id], isAlr)
		// Фиксируем изменение состояния
		if (isAlr) {
			acc[el._id].alarm = true
			acc.alarm = true
			return
		}
		if (last?.DO !== cur) accDeb[el._id].push({ DO: cur, date: new Date() })
		// Размер очереди превышен
		if (accDeb[el._id].length > _LEN) accDeb[el._id].shift()

		// Проверка на дребезг, после _LEN переключений
		if (accDeb[el._id].length < _LEN) return

		const delta = accDeb[el._id].at(-1).date - accDeb[el._id][0].date
		// Время между последними состояниями больше порога дребезга -> ОК
		if (delta > threshold) return
		//Время меньше порога -> установка аварии
		const mesBeg = sect?.name ? bld.name + '. ' + sect?.name + '. ' : bld.name + '. '
		wrExtralrm(bld._id, 'debounce', el._id, msgBB(bld, 102, mesBeg, el.name))
		acc[el._id].alarm = true
		acc.alarm = true
	})
}
