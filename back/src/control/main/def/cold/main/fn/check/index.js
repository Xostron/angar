const { compareTime } = require('@tool/command/time')
const skip = ['off-off-on', 'off-off-off-add']
const max = 2
const maxCombi = 3
const def = require('../../def_cooler')
const { data: store } = require('@store')

// Проверка на включение оттайки
function checkDefrost(fnChange, accAuto, acc, se, s, stateCooler, clr, bld) {
	console.log(
		'\t',
		5551,
		'состояние испарителя',
		stateCooler,
		!!def.cold[stateCooler],
		'Неисправность модулей=',
		stateCooler?.status === 'alarm'
	)
	// Проверка состояния
	if (!def?.cold?.[stateCooler]) {
		console.log('\tПроверка состояния - bad', stateCooler)
		fnChange(0, 0, 0, 0, null, clr)
		return true
	}
	// Уже в оттайке или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler) || acc?.state?.waitDefrost) {
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
	const tmp =
		accAuto.timeAD === null
			? se.cooler.tmpCooler <= s?.cooler?.defrostOn
			: se.cooler.tmpCooler <= s?.cooler?.defrostOn && accAuto.timeAD
	const time = compareTime(accAuto.targetDT, s.cooler.defrostWait)
	console.log(`\t Условия Оттайки ${tmp} || ${time} || ${accAuto.defrostAll}`)
	// Запуск оттайки по температуре и времени
	if (tmp || time || accAuto.defrostAll) {
		acc.state.defrostCount ??= 0
		acc.state.defrostCount += 1
		console.log('\tОттайка по ', tmp ? 'тмп. дт. всасывания' : 'времени между интервалами')
		// Флаг входа в оттайку всех испарителей
		accAuto.defrostAll = new Date()
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
function checkDefrostCombi(fnChange, accCold, acc, se, s, stateCooler, clr, bld) {
	console.log(
		'\t',
		5552,
		'состояние испарителя',
		stateCooler,
		!!def.combi[stateCooler],
		'Неисправность модулей=',
		stateCooler?.status === 'alarm'
	)
	// Проверка состояния
	if (!def?.combi?.[stateCooler]) {
		fnChange(0, 0, 0, 0, null, clr)
		return true
	}
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
	const tmp =
		accCold.timeAD === null
			? se.cooler.tmpCooler <= s?.coolerCombi?.defrostOn
			: se.cooler.tmpCooler <= s?.coolerCombi?.defrostOn && accCold.timeAD
	// Время между циклами разморозками -> если оттайки не было более Х часов -> вкл оттайки
	const time = compareTime(accCold.targetDT, s.coolerCombi.defrostWait)
	// console.log(777, se.cooler.tmpCooler ,  s?.coolerCombi?.defrostOn, accCold.targetDT, )
	// Запуск оттайки по температуре || времени || один из испарителей секции требует оттайки (все остальные идут за ним в оттайку)
	if ((tmp || time || accCold.defrostAll) && !store.alarm.achieve?.[bld._id]?.combi?.finish) {
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
