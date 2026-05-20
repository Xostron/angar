function action(idB, idS, mS, couple, s, seS, fnChange, accAuto, alrAuto, sectM, obj, reason) {
	const accept = accAuto?.cold?.[idS].pressure
	if (!accept) return

	// Порядок отключения (или 50%) испарителей секции начиная с 0-го
	couple.reverse().sort((a, b) => a.length - b.length)
console.log(13, couple)
	// Отключаем испарители начиная с одиночных испарителей, порядок отключения с конца
	// Список отключенных испарителей
	accAuto.cold[idS].queue ??= []

	// couple.forEach((pair) => {
	// 	const code = pair.length > 1 ? 'pair' : 'single'

	// 	def[code](pair, mS, fnChange, accAuto, reason)
	// })
}

module.exports = action

const def = {
	single(pair, mS, fnChange, accAuto, reason) {
		const clr = mS.coolerS.find((el) => el._id === pair.at(-1))

		if (!reason) return

		// Причина актуальная - выкл испаритель + включить заслонку
		accAuto.cold ??= {}
		accAuto.cold[pair[0]] ??= {}
		// Флаг испаритель выключен по высокому давлению
		accAuto.cold[pair[0]].offPressure = new Date()
		// Выключаем испаритель и включаем заслонку
		fnChange(0, 0, 0, 0, null, clr)
		console.log(7788, 'single', pair, clr)
	},
	pair(pair, mS, fnChange, accAuto, reason) {
		const clr = mS.coolerS.find((el) => el._id === pair.at(-1))

		if (!reason) return

		accAuto.cold ??= {}
		accAuto.cold[pair.at(-1)] ??= {}
		// Флаг испаритель выключен по высокому давлению
		accAuto.cold[pair.at(-1)].offPressure = new Date()
		// Для всей пары устанавливаем флаг задание 50% при высоком давлении
		pair.forEach((id) => {
			accAuto.cold[id] ??= {}
			accAuto.cold[id].offPressureSP = 50
		})
		// У пары выключаем соседний испаритель и включаем заслонку, + задание частоты ВНО 50%
		fnChange(0, null, 0, 0, null, clr)
		console.log(7788, 'pair')
	},
}
