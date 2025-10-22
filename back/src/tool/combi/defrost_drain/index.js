const { compareTime } = require('@tool/command/time')
/**
 * Синхронизация оттайки-слива_воды испарителей
 * Хотя бы один испаритель перешел в оттайку, все остальные переходят
 * Выход из слива воды по последнему испарителю
 * @param {*} accCold Аккумулятор по холодильнику комбинированного склада
 * @param {*} cooler список испарителей
 * @param {*} obj глобальные данные склада
 */
function defrostAll(accCold, cooler, obj, s) {
	// const skip = ['off-off-on', 'off-off-off-add']
	// Флаг время после слива воды
	accCold.afterD ??= null
	accCold.timeAD ??= null
	// Только рабочие испарители
	cooler = cooler.filter((el) => Object.keys(accCold[el._id]?.state ?? {}).length)
	// Флаг оттайка закончена на всех испарителях данной секции
	accCold.defrostAllFinish = cooler.every((el) => accCold?.[el._id]?.state?.waitDefrost)
	// Флаг входа в оттайку всех испарителей
	if (accCold.defrostAllFinish) accCold.defrostAll = null
	// Флаг выхода из слива воды всех испарителей
	accCold.drainAll = cooler?.length && cooler.every((el) => accCold[el._id]?.state?.add)
	// Флаг время после слива воды
	if (accCold.drainAll) accCold.afterD = new Date()
	/* 
	Флаг время после слива воды:
	Игнорируем переход в оттайку после слива воды
	По достижению времени разрешаем оттайку, флаги сбрасываем
	*/
	// Время прошло -> сбрасываем время ожидания
	if (accCold.timeAD) (accCold.afterD = null), (accCold.timeAD = null)
		// Время ожидания после слива воды установилось (слив воды был закончен)
	if (accCold.afterD)
		accCold.timeAD = compareTime(
			accCold.afterD,
			s?.coolerCombi?.afterDrain ?? s?.cooler?.afterDrain
		)
	console.log(
		'******Время после слива afterDrain=',
		s?.coolerCombi?.afterDrain ?? s?.cooler?.afterDrain,
		'accCold.timeAD',
		accCold.timeAD,
		'accCold.afterD',
		accCold.afterD
	)
	console.log('********defrostALL')
	console.table(
		[{ Флаг_отайки: accCold.defrostAll, Флаг_слив_воды: accCold.drainAll }],
		['Флаг_отайки', 'Флаг_слив_воды']
	)
}

module.exports = defrostAll
