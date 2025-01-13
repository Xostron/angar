const logger = require('@tool/logger')
const { data: store } = require('@store')

/**
 * Логирование периферии
 * @param {object[]} arr данные рамы текущего механизма
 * @param {object} value данные с модулей
 * @param {object} prev хранилище прошлого значения
 * @param {string} level приоритет логирования
 * @returns
 */
function pLog(arr, value, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		const { _id } = el
		if (!check(value?.[_id], store.prev[_id])) return
		// фиксируем состояние по изменению
		store.prev[_id] = value[_id]
		switch (level) {
			case 'fan':
			case 'cooler':
			case 'device':
			case 'aggregate':
				logger[level]({ _id, message: { state: value[_id]?.state } })
				break
			case 'valve':
				valve(_id, value[_id], store.prev[_id])
				break
			// case 'sensor':
			// 	logger[level]({ _id, message: { value: value[_id]?.value, state: value[_id]?.state, type: el.type } })
			// 	break
			default:
				logger[level]({ _id, message: value[_id] })
				break
		}
	})
}

/**
 * Разрешение на запись в логи
 * @param {object} val состояние
 * @returns {boolean}
 */
function check(val, prev) {
	// Значение состояния
	if (val === null || val === undefined) return false
	// Состояние не изменилось
	if (JSON.stringify(val) === JSON.stringify(prev)) return false
	return true
}

/**
 * Логирование клапана по концевикам
 * @param {*} _id
 * @param {*} val
 * @param {*} prev
 */
function valve(_id, val, prev) {
	val?.close ? logger['valve']({ _id, message: { state: 'cls' } }) : logger['valve']({ _id, message: { state: 'opn' } })
}

/**
 * Логирование неисправностей
 * @param {object[]} arr массив текущих неисправностей
 * @param {object} prev хранилище прошлого значения
 */
function alarmLog(arr) {
	arr.forEach((el) => {
		const message = el.title + ' ' + el.msg
		if (el.date === store.prev[message]) return
		// фиксируем состояние по изменению
		store.prev[message] = el.date
		logger['alarm']({ _id: el.buildingId, message })
	})
}

function sensLog(total, building) {
	building.forEach((bld) => {
		const val = total[bld._id]
		;['hin', 'tprdL'].forEach((el) => {
			const id = bld._id + '_' + el
			if (!check(val[el], store.prev[id])) return
			// фиксируем состояние по изменению
			store.prev[id] = val[el]
			const m = el === 'hin' ? 'max' : 'min'
			logger['sensor']({ id: bld._id, message: { type:el, state: val[el]?.state, value: val[el]?.[m] } })
		})
	})
}
module.exports = { pLog, alarmLog, sensLog }
