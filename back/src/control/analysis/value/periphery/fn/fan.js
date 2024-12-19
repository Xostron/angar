const { stateF } = require('@tool/command/fan')
const { engineHour } = require('@tool/command/time')

// Состояние вентиляторов
function fan(equip, val, retain, ehour, result) {
	const { fan } = equip
	fan.forEach((el) => {
		result[el._id] ??= {}
		result[el._id].state = stateF(el, equip, result, retain)
		engineHour(el, result[el._id].state, ehour)
	})
}

module.exports = fan


