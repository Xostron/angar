const { stateF } = require('@tool/fan')

// Состояние вентиляторов
function fan(equip, val, retain, result) {
	const { fan, binding } = equip
	fan.forEach((el) => {
		result[el._id] ??= {}
		// Состояние ВНО: run,stop
		result[el._id].state = stateF(el, equip, result, retain)
		// Поиск аналогового выхода ВНО
		const ao = binding.find((b) => b.owner.id === el._id && b.type==='ao')
		if (!!ao) result[el._id].value = result?.outputM?.[ao.moduleId]?.[ao.channel - 1]
		// Поиск аналогового входа
		const ai = binding.find((b) => b.owner.id === el._id && b.type==='ai')
		if (!!ai) result[el._id].vai = result?.[ai._id]?.value
	})
}

module.exports = fan
