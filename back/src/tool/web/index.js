const { fnSCard } = require('@tool/web/section_card')
const { fnSBarB } = require('@tool/web/section_card/fn')
const { fnBCard, fnBSide } = require('@tool/web/bld_card')
const innerSec = require('@tool/web/inner_section/innerSec')

function web(v, obj) {
	// Данные для web клиента
	const r = {
		...v,
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

module.exports = web
