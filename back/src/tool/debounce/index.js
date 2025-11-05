const { data: store } = require('@store')
// Кол-во замеров
const _LEN = 4
// Чувствительность, мс
const _THRESHOLD = 30 * 1000
/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel), клапаны (in,out), подогрев клапанов (heating), оттайка испарителя(cooler), обогрев слива воды(water)
 * @param {*} obj
 */
function debDO(obj, outputEq) {
	const { data: equip, value } = obj
	const { fan, valve, heating } = equip
	store.debounce ??= {}
	deb(fan, outputEq, store.debounce)
	// deb(valve,value)
	// deb(heating,value)
}
/**
 *
 * @param {*} arr ИД исполнительного механизма
 * @param {*} value Глобальные данные
 */
function deb(arr, outputEq, acc) {
	console.log(store.debounce)

	arr.forEach((el) => {
		acc[el._id] ??= []
		const DO = outputEq[el._id]
		// Фиксируем изменение состояния
		if (acc[el._id].at(-1)?.DO !== DO) acc[el._id].push({ DO, date: new Date() })
		// Размер очереди превышен
		if (acc[el._id].length > _LEN) acc[el._id].shift()
		// Проверка на дребезг
	})
}

module.exports = debDO
