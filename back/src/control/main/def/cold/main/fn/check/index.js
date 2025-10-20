const { compareTime } = require('@tool/command/time')
const skip = ['off-off-on', 'off-off-off-add']
const max = 2
const maxCombi = 3

// Проверка на включение оттайки
function checkDefrost(fnChange, accAuto, acc, se, s, stateCooler, clr) {
	// Уже в оттайке или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler)) {
		// Инициализация счетчика
		if (!acc.state.defrostCount) acc.state.defrostCount = 1
		// TODO Авария при достижение максимума
		if (acc.state.defrostCount > max)
			console.log(
				`\n\n\t********** Повторили Оттайку ${acc.state.defrostCount} раз, максимум =${max}`
			)
		return false
	}

	// Температура на всасывании испарителя
	const tmp = se.cooler.tmpCooler <= s?.cooler?.defrostOn
	const time = compareTime(accAuto.targetDT, s.cooler.defrostWait)
	// Запуск оттайки по температуре и времени
	if (tmp || time || accAuto.defrostAll) {
		acc.state.defrostCount ??= 0
		acc.state.defrostCount += 1
		console.log('\tОттайка по ', tmp ? 'тмп. дт. всасывания' : 'времени между интервалами')
		fnChange(0, 0, 1, 0, 'defrost', clr)
		return true
	}
	// Очистка флага
	if (acc?.state?.defrostCount) delete acc?.state?.defrostCount
	return false
}

/**
 *
 * @param {*} fnChange Функция вкл/выкл механизмов испарителя oneChange
 * @param {*} accCold Аккумулятор холодильника accAuto.cold
 * @param {*} acc Аккумулятор испарителя accAuto.cold[clr._id]
 * @param {*} se Датчики испарителя
 * @param {*} s Настройки
 * @param {*} stateCooler Состояние испарителя
 * @param {*} clr Рама испарителя
 * @returns {boolean} true-заблокировать ()
 */
function checkDefrostCombi(fnChange, accCold, acc, se, s, stateCooler, clr) {
	console.log('\t', 5551, 'состояние испарителя', stateCooler)
	// Уже в оттайке (ожидание) или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler) || acc?.state?.waitDefrost) {
		// Инициализация счетчика
		if (!acc.state.defrostCount) acc.state.defrostCount = 1
		// TODO Авария при достижение максимума
		if (acc.state.defrostCount > maxCombi)
			console.log(
				`\n\n\t********** Повторили Оттайку ${acc.state.defrostCount} раз, максимум =${maxCombi}`
			)
		return false
	}

	// Температура на всасывании<=Температура включения цикла разморозки -> вкл оттайки
	const tmp = se.cooler.tmpCooler <= s?.coolerCombi?.defrostOn
	// Время между циклами разморозками -> если оттайки не было более Х часов -> вкл оттайки
	const time = compareTime(accCold.targetDT, s.coolerCombi.defrostWait)
	// console.log(777, se.cooler.tmpCooler ,  s?.coolerCombi?.defrostOn, accCold.targetDT, )
	// Запуск оттайки по температуре || времени || один из испарителей секции требует оттайки (все остальные идут за ним в оттайку)
	if (tmp || time || accCold.defrostAll) {
		// Уже была оттайка( ждем остальных испарителей) -> пропустить
		// if (acc?.state?.waitDefrost) return false
		acc.state.defrostCount ??= 0
		acc.state.defrostCount += 1
		console.log(
			'\tОттайка по ',
			tmp ? 'тмп. дт. всасывания' : time ? 'времени между интервалами' : 'один за всех'
		)
		// Флаг входа в оттайку всех испарителей
		accCold.defrostAll = new Date()
		fnChange(0, 0, 1, 0, 'defrost', clr)
		return true
	}
	// Очистка флага
	if (acc?.state?.defrostCount) delete acc?.state?.defrostCount
	return false
}

module.exports = { cold: checkDefrost, combi: checkDefrostCombi }
