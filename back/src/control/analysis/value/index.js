const { data: store } = require('@store/index')
const { fnBCard, fnBSide } = require('@tool/web/bld_card')
const innerSec = require('@tool/web/inner_section/innerSec')
const { fnSCard } = require('@tool/web/section_card')
const { fnSBarB } = require('@tool/web/section_card/fn')

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
		// Карточки складов + правая боковая панель
		bCard: fnBCard(obj),
		// Левая боковая панель уличные датчики
		bSide: fnBSide(obj),
		// Карточки секций
		sCard: fnSCard(obj),
		innerSec: innerSec(obj),
		// Страница секции: аварии склада - depriciated
		// sBarB: fnSBarB(),
	}
	// console.log(234, r.bCard)
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
