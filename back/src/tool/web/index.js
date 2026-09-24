const { fnSCard } = require('@tool/web/section_card')
const { fnSBarB } = require('@tool/web/section_card/fn')
const { fnBCard, fnBSide } = require('@tool/web/bld_card')
const fnInnerSec = require('@tool/web/inner_section/innerSec')

function web(v, obj) {
	// Данные для web клиента
	// Карточки секций
	const sCard = fnSCard(obj)
	// Содержимое секции
	const innerSec = fnInnerSec(obj, sCard)
	// console.log(11, sCard?.['6800b88d56c6a01c90ecbc5e']?.['6800bbc056c6a01c90ecbc84'])
	// console.log(22, innerSec?.['6800b88d56c6a01c90ecbc5e']?.['6800bbc056c6a01c90ecbc84'])

	const r = {
		...v,
		// Для нового дизайна
		// Карточки складов + правая боковая панель
		bCard: fnBCard(obj),
		// Левая боковая панель уличные датчики
		bSide: fnBSide(obj),
		sCard,
		innerSec,
		// sBarB: fnSBarB(),
	}
	// console.log(234, r.bCard)
	return r
}

module.exports = web
