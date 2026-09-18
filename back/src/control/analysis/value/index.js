const { data: store } = require('@store/index')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(obj) {
	// Данные для web клиента
	const r = {
		// Старый дизайн
		...(obj.value ?? {}),
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
	}
	return r
}

module.exports = value

// function fnDiff(curr, prev){
// 	for (const key in curr){
// 		if (curr[key] instanceof Object) fnDiff(curr[key],prev[key])
// 			else{

// 			}
// 	}
// }

// store.value = { ...obj.value, retain:obj.retain, factory:obj.factory, alarm: r }
