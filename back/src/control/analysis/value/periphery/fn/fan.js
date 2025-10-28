const { stateF } = require('@tool/command/fan/fn')

// Состояние вентиляторов
function fan(equip, val, retain, result) {
	const { fan, binding } = equip
	fan.forEach((el) => {
		result[el._id] ??= {}
		// Состояние ВНО: run,stop
		result[el._id].state = stateF(el, equip, result, retain)
		// Поиск аналогового выхода ВНО
		const ao = binding.find((b) => b.owner.id === el._id)
		if (!!ao) result[el._id].value = result?.outputM?.[ao.moduleId]?.[ao.channel - 1]
	})
}

module.exports = fan


