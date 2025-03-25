const { data } = require('@store')

// Сброс аварий - установить/обнулить
function reset(obj, type = true) {
	// обнулить
	if (!type) {
		return data.reset.clear()
	}
	// установить
	data.reset.add(obj.buildingId)
}

// Наличие: Сброс аварии на данном складе
function isReset(buildingId) {
	return data.reset.has(buildingId)
}

module.exports = { reset, isReset }
