const { compareTime, onTime } = require('@tool/command/time')

// Оттайка
function defrost(fnChange, accCold, acc, se, s, bld, clr) {
	onTime('defrost', acc)
	const time = compareTime(acc.state.defrost, s.coolerCombi.defrostWork)
	const t = se.cooler.tmpCooler >= s.coolerCombi.defrostOff
	if (!acc.state.defrost) acc.state.defrost = new Date()
	if (time || t) {
		if (time) console.log('defrost', 'Истекло отведенное время')
		else
			console.log(
				'defrost',
				`Достигнута  целевая тмп.  дт. всасывания ${se.cooler.tmpCooler} >= ${s.coolerCombi.defrostOff}`
			)
		// Отключаем оттайку и ждем остальных испарителей для перехода в слив воды
		// -> перекинет на off-off-off (обработчик src\control\main\def\cold\main\def_cooler\combi\off\index.js)
		fnChange(0, 0, 0, 0, null, clr)
		// Флаг ожидания пока все остальные пройдут оттайку
		if (!acc?.state?.waitDefrost) acc.state.waitDefrost = new Date()
	}
}

module.exports = defrost
