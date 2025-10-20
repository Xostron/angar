/**
 * Синхронизация оттайки-слива_воды испарителей
 * Хотя бы один испаритель перешел в оттайку, все остальные переходят
 * Выход из слива воды по последнему испарителю
 * @param {*} accCold Аккумулятор по холодильнику комбинированного склада
 * @param {*} cooler список испарителей
 * @param {*} obj глобальные данные склада
 */
function defrostAll(accCold, cooler, obj) {
	// const skip = ['off-off-on', 'off-off-off-add']
	// Только рабочие испарители
	cooler = cooler.filter((el) => Object.keys(accCold[el._id]?.state ?? {}).length)
	// Флаг оттайка закончена на всех испарителях данной секции
	accCold.defrostAllFinish = cooler.every((el) => accCold?.[el._id]?.state?.waitDefrost)
	// Флаг входа в оттайку всех испарителей
	if (accCold.defrostAllFinish) accCold.defrostAll=null
	// Флаг выхода из слива воды всех испарителей
	accCold.drainAll = cooler.every((el) => accCold[el._id]?.state?.add)
	
	console.log('********defrostALL')
	console.table(
		[{ Флаг_отайки: accCold.defrostAll, Флаг_слив_воды: accCold.drainAll }],
		['Флаг_отайки', 'Флаг_слив_воды']
	)
}

module.exports = defrostAll
