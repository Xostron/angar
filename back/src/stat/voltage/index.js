const { logger } = require('@tool/logger')
const { data: store } = require('@store')
const { check, fnPrev } = require('../fn')
const message = require('../fn/mes')
const { compareTime } = require('@tool/command/time')
const _min1 = 60 * 1000
const _min10 = 10 * 60 * 1000
/**
 * Статистика электроизмерений Напряжения - Сбор данных периодически и по критическим изменениям
 */
async function pLogVoltage(data, value, force) {
	const pui = data.device.filter((el) => el.device.code === 'pui')
	if (!pui?.length) return

	pLog(data, pui, value, 'voltage', force)
}

module.exports = pLogVoltage

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
		// Время (точка отсчета)
		store.heap.voltage[_id] ??= {}
		store.heap.voltage[_id].min1 ??= null
		store.heap.voltage[_id].min10 ??= null

		// Если не было изменений показаний - логируем раз в 10 мин
		if (!check(value?.[_id], store.prev[_id], level) && !force) {
			if (!store.heap.voltage[_id].min10) {
				// Первый цикл
				logger[level]({ message: message(data, el, level, value) })
				store.heap.voltage[_id].min10 = new Date()
				return
			}
			// Следующие циклы, ждем таймер
			if (!compareTime(store.heap.voltage[_id].min10, _min10)) return
			// Время прошло - лог
			logger[level]({ message: message(data, el, level, value) })
			store.heap.voltage[_id].min10 = new Date()
			return
		}
		
		if (!store.heap.voltage[_id].min1) {
			// Первый цикл
			logger[level]({ message: message(data, el, level, value) })
			store.heap.voltage[_id].min1 = new Date()
			return
		}
		// Следующие циклы, ждем таймер
		if (!compareTime(store.heap.voltage[_id].min1, _min1)) return
		// Время прошло - лог
		logger[level]({ message: message(data, el, level, value) })
		store.heap.voltage[_id].min1 = new Date()
	})
}
