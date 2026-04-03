const { loggerEvent } = require('@tool/logger')
const { data: store } = require('@store')
/**
 * Логирование перезагрузки POS
 * @param {object[]} arr массив текущих сообщений
 * @param {object} prev хранилище прошлого значения
 * @param {object} level уровень
 * @param {boolean} force принудительное логирование
 */
function firstLog(building, level) {
	if (!store._first) return
	building.forEach((el) => {
		const message = {
			uid: 1,
			bldId: el._id,
			title: (el.name + '. Перезагрузка POS-терминала').trim(),
			value: true,
		}
		loggerEvent[level]({ message })
	})
}

module.exports = firstLog
