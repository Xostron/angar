const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
/**
 * Синхронизация оттайки-слива_воды испарителей
 * Хотя бы один испаритель перешел в оттайку, все остальные переходят
 * Выход из слива воды по последнему испарителю
 * @param {*} accCold Аккумулятор по холодильнику комбинированного склада
 * @param {*} cooler список испарителей
 * @param {*} obj глобальные данные склада
 */
function defrostAll(idB, accCold, cooler, obj, s) {
	// Только рабочие испарители
	const clrs = cooler.filter((el) => !store?.denied?.[idB]?.[el._id])
	// const skip = ['off-off-on', 'off-off-off-add']
	// Флаг время после слива воды - Начальная точка
	accCold.afterD ??= null
	// Флаг время после слива воды - конечная точка (время ожидания после слива воды)
	accCold.timeAD ??= null
	// Флаг оттайка закончена на всех испарителях по складу
	accCold.defrostAllFinish = clrs.every((el) => accCold?.[el._id]?.state?.waitDefrost)
	// Сброс флага "Всем испарителям начать оттайку"
	if (accCold.defrostAllFinish) accCold.defrostAll = null
	// Флаг сейчас идет слив воды у всех испарителей
	accCold.drainAll = !!clrs?.length && clrs.every((el) => accCold[el._id]?.state?.add)
	// Обновляем время - начальной точки (время ожидания после слива воды)
	if (accCold.drainAll) accCold.afterD = new Date()

	// Время прошло -> сбрасываем время ожидания
	if (accCold.timeAD) (accCold.afterD = null), (accCold.timeAD = null)
	// Время ожидания после слива воды (конечная точка)(слив воды был закончен)
	accCold.timeAD =
		accCold.afterD &&
		compareTime(accCold.afterD, s?.coolerCombi?.afterDrain ?? s?.cooler?.afterDrain)

	consoleTable(accCold, s)
}

module.exports = defrostAll

function consoleTable(accCold, s) {
	console.log(
		'\x1b[35m%s\x1b[0m',
		'\n---------------------------------------defrostALL---------------------------------------',
		`timeAD = compareTime(${accCold.afterD}, ${
			s?.coolerCombi?.afterDrain ?? s?.cooler?.afterDrain
		})`
	)
	console.table(
		[
			{
				'defrostAll(Оттайка_начало)': accCold.defrostAll,
				'defrostAllFinish(Оттайка_окончена)': accCold.defrostAllFinish,
			},
		],
		['defrostAll(Оттайка_начало)', 'defrostAllFinish(Оттайка_окончена)']
	)
	console.table(
		[
			{
				'drainAll(Слив_воды_окончен)': accCold.drainAll,
				'afterD(Ожидание_после_слива)': accCold.afterD,
				'timeAD(Время_после_слива)': accCold.timeAD,
			},
		],
		['drainAll(Слив_воды_окончен)', 'afterD(Ожидание_после_слива)', 'timeAD(Время_после_слива)']
	)
}
