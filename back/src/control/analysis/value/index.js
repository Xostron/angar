const { data: store } = require('@store/index')
const { fnBCard, fnBSide } = require('@tool/web/bld')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(obj) {
	// console.log(234, fnBCard(obj), fnBSide(obj))
	// console.log(obj.value.total, obj.value.total['69f9dd09c35ea05200898cd8'])
	// Данные для web клиента
	return {
		// Старый дизайн
		...(obj.value ?? {}),
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
		// Для нового дизайна
		// Карточки складов
		bcard: fnBCard(obj),
		bside: fnBSide(obj),
	}
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
