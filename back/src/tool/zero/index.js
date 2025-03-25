const { data } = require('@store')

// Команада: Обнулить счетчик сушки
function zero(obj, type = true) {
	// обнулить
	if (!type) {
		return data.zero.clear()
	}
	// установить
	data.zero.add(obj.buildingId)
}

// Проверить есть ли команда на обнуление счетчика сушки
function isZero(buildingId) {
	return data.zero.has(buildingId)
}

module.exports = { zero, isZero }
