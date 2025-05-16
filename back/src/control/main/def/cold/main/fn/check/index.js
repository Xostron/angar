const { compareTime } = require('@tool/command/time')
const skip = ['off-off-on', 'off-off-off-add']
const max = 2

// Проверка на включение оттайки
function checkDefrost(fnChange, acc, se, s, stateCooler, clr) {
	// Уже в оттайке или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler)) {
		// Инициализация счетчика
		if (!acc.state.defrostCount) acc.state.defrostCount = 1
		// TODO Авария при достижение максимума
		if (acc.state.defrostCount > max) console.log(`\n\n\t********** Повторили Оттайку ${acc.state.defrostCount} раз, максимум =${max}`)
		return false
	}

	// Температура на всасывании испарителя
	const tmp = se.cooler.tmpCooler <= s?.cooler?.defrostOn
	const time = compareTime(acc.targetDT, s.cooler.defrostWait)
	// Запуск оттайки по температуре и времени
	if (tmp || time) {
		acc.state.defrostCount += 1
		console.log('\tОттайка по ', tmp ? 'тмп. дт. всасывания' : 'времени между интервалами')
		// acc.targetDT = new Date()
		fnChange(0, 0, 1, 0, 'defrost', clr._id)
		return true
	}
	// Очистка флага
	if (acc?.state?.defrostCount) delete acc?.state?.defrostCount
	return false
}

function checkDefrostCombi(fnChange, acc, se, s, stateCooler, clr) {
	// Уже в оттайке или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler)) {
		// Инициализация счетчика
		if (!acc.state.defrostCount) acc.state.defrostCount = 1
		// TODO Авария при достижение максимума
		if (acc.state.defrostCount > max) console.log(`\n\n\t********** Повторили Оттайку ${acc.state.defrostCount} раз, максимум =${max}`)
		return false
	}

	// Температура на всасывании  <= Температура включения цикла разморозки
	const tmp = se.cooler.tmpCooler <= s?.coolerCombi?.defrostOn
	// Время между циклами разморозками
	const time = compareTime(acc.targetDT, s.coolerCombi.defrostWait)
	console.log('JJJJJJJJJJJJJJJJJJJJ', tmp, time)
	// Запуск оттайки по температуре и времени
	// TODO Combi: 
	if (tmp || time) {
		acc.state.defrostCount += 1
		console.log('\tОттайка по ', tmp ? 'тмп. дт. всасывания' : 'времени между интервалами')
		// acc.targetDT = new Date()
		fnChange(0, 0, 1, 0, 'defrost', clr)
		return true
	}
	// Очистка флага
	if (acc?.state?.defrostCount) delete acc?.state?.defrostCount
	return false
}

module.exports = { cold: checkDefrost, combi: checkDefrostCombi }
