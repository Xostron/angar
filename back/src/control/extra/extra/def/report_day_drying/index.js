const { fnInit, fnEnd, check24h, fnRotate } = require('./fn')
const { fnEnable } = require('./fn/allow')

// Суточные моточасы режима сушка
function rdDrying(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// Проверка изменения суток
	check24h(acc)

	// Подсчет моточасов не активен
	if (!fnEnable(bld._id, obj)) {
		// Завершение подсчета
		fnEnd(acc)
		return
	}

	// Подсчет моточасов активен
	// Инициализация и проверка работы сушки
	fnInit(bld, m, obj, acc)
	fnRotate(acc)
}

module.exports = rdDrying
