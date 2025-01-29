const { ctrlB } = require('@tool/command/fan')

// Разгонные вентиляторы: Вкл (Заметка еще управляются из окуривания smoking)
function on(building, fanA) {
	fanA.forEach((f) => {
		ctrlB(f, building._id, 'on')
	})
}
// Разгонные вентиляторы: Выкл
function off(building, fanA) {
	fanA.forEach((f) => {
		ctrlB(f, building._id, 'off')
	})
}

// Разгонные вентиляторы: Авто (работают синхронно с вентиляторрами испарителя)
function auto(building, fanA, acc, se, s, m, obj) {
	// Состояние вентиляторов испарителя
	const fanCooler = obj.value[m.cold.cooler[0]._id].state.split('-')?.[1]
	//вкл/выкл разгонные вентиляторы
	fanCooler === 'on' ? on(building, fanA) : off(building, fanA)
}

module.exports = {
	on,
	off,
	auto,
}
