const { data: store } = require('@store/index')
const { fnBCard, fnBSide } = require('@tool/web/bld')
const { fnSCard } = require('@tool/web/section')
const { fnSBarB } = require('@tool/web/section/fn')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(obj) {
	// console.log(obj.value.total, obj.value.total['69f9dd09c35ea05200898cd8'])
	// Данные для web клиента
	const r = {
		// Старый дизайн
		...(obj.value ?? {}),
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
		// Для нового дизайна
		// Карточки складов
		bCard: fnBCard(obj),
		// Страница склад: уличные датчики
		bSide: fnBSide(obj),
		// Карточка секций
		sCard: fnSCard(obj),
		// Страница секции: аварии склада
		sBarB: fnSBarB(),
	}
	// console.log(234, r.sCard)
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
