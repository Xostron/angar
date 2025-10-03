/**
 * Синхронизация оттайки-слива_воды испарителей
 * Хотя бы один испаритель перешел в оттайку, все остальные переходят
 * Выход из слива воды по последнему испарителю
 * @param {*} accCold Аккумулятор по холодильнику комбинированного склада
 * @param {*} cooler список испарителей
 * @param {*} obj глобальные данные склада
 */
function defrostAll(accCold, cooler, obj) {
	const skip = ['off-off-on', 'off-off-off-add']
	// Фильтр: только рабочие испарители
	cooler = cooler.filter((el) => Object.keys(accCold[el._id]?.state ?? {}).length)
	// Флаг входа в оттайку всех испарителей
	accCold.defrostAll = cooler.some((el) => skip.includes(obj.value[el._id]?.state))
	// Флаг выхода из слива воды всех испарителей
	accCold.drainAll = cooler.every((el) => accCold[el._id]?.state?.drainAll)
}

module.exports = defrostAll
