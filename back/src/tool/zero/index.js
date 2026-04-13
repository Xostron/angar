const { data } = require('@store')

// Команада: Обнулить счетчик сушки
function zero(obj, type = true) {
	// обнулить
	if (!type) {
		return data.zero.clear()
	}
	// установить
	data.zero.add(obj.buildingId)
	console.log(5432, 'zero add', data.zero, type)
}

// Проверить есть ли команда на обнуление счетчика сушки
function isZero(buildingId) {
	console.log(4321, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',buildingId, data.zero, data.zero.has(buildingId))
	return data.zero.has(buildingId)
}

module.exports = { zero, isZero }
