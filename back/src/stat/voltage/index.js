const { logger } = require('@tool/logger')
const { data: store } = require('@store')
const { check, fnPrev } = require('../fn')
const message = require('../fn/mes')
const { compareTime } = require('@tool/command/time')
const _min1 = 60 * 1000
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
		store.heap.voltage[_id] ??= new Date()
		// Если не было изменений показаний - выходим из лога
		if (!check(value?.[_id], store.prev[_id], level) && !force) return
		// Обновляем прошлое состояние
		// fnPrev(_id, value[_id], level)
		// 1 мин
		if (!compareTime(store.heap.voltage[_id], _min1)) return
		// Пишем в логи
		logger[level]({ message: message(data, el, level, value) })
		store.heap.voltage[_id] = new Date()
	})
}
