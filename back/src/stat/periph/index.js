const { logger } = require('@tool/logger')
const { data: store } = require('@store')
const {check, fnPrev, message} = require('../fn')
/**
 * Логирование периферии
 * @param {object} data Рама pc
 * @param {object[]} arr данные рамы текущего механизма
 * @param {object} value данные с модулей
 * @param {object} prev хранилище прошлого значения
 * @param {string} level приоритет логирования
 * @returns
 */
function pLog(data, arr, value, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		const { _id } = el
		// Проверка изменения были?
		if (!check(value?.[_id], store.prev[_id], level)) return
		// фиксируем состояние по изменению
		fnPrev(_id, value[_id], level)
		// Лог
		// if (level === 'heating') console.log(111)
		logger[level]({ message: message(data, el, level, value) })
	})
}

module.exports = pLog