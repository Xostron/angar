const { logger } = require('@tool/logger')
const { data: store } = require('@store')
const { check, fnPrev, message } = require('.')

/**
 * Логирование периферии (запись в лог по изменению состояния)
 * @param {object} data Рама pc
 * @param {object[]} arr данные рамы текущего механизма
 * @param {object} value данные с модулей
 * @param {object} prev хранилище прошлого значения
 * @param {string} level приоритет логирования
 * @param {boolean} force принудительное логирование
 * @returns
 */
function pLog(data, arr, value, level, force) {
	if (!arr?.length) return
	arr.forEach((el) => {
		const { _id } = el
		// Если не было изменений показаний - выходим из лога
		if (level=='voltage') console.log(88, value?.[_id], store.prev[_id])
		if (!check(value?.[_id], store.prev[_id], level) && !force) return
		// Обновляем прошлое состояние
		fnPrev(_id, value[_id], level)
		// Пишем в логи
		logger[level]({ message: message(data, el, level, value) })
	})
}

module.exports = pLog
