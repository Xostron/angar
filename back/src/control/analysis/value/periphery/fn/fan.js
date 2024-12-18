const { stateF } = require('@tool/command/fan')

// Состояние вентиляторов
function fan(equip, val, retain, result) {
	const { fan } = equip
	fan.forEach((el) => {
		result[el._id] ??= {}
		result[el._id].state = stateF(el, equip, result, retain)
	})
}

module.exports = fan
