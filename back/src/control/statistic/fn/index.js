const logger = require('@tool/logger')
const { data: store } = require('@store')
const { getIdSB } = require('@tool/command/building')
/**
 * Логирование периферии
 * @param {string[]} section Рама секций
 * @param {object[]} arr данные рамы текущего механизма
 * @param {object} value данные с модулей
 * @param {object} prev хранилище прошлого значения
 * @param {string} level приоритет логирования
 * @returns
 */
function pLog(section, arr, value, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		const { _id } = el
		if (!check(value?.[_id], store.prev[_id])) return
		// фиксируем состояние по изменению
		store.prev[_id] = value[_id]
		// Лог
		logger[level]({ message: message(el, level, value, section) })
	})
}

/**
 * Данные для лога
 * @param {object} el Элемент рамы
 * @param {string} level Уровень лога (Имя лог файла)
 * @param {object} value Глобальный объект со значениями склада
 * @param {object[]} section Рама секций
 * @returns
 */
function message(el, level, value, section) {
	let secId, bldId, clrId, v
	switch (level) {
		case 'fan':
			el.owner.type == 'section' ? (secId = el.owner.id) : (bldId = el.owner.id)
			break
		case 'device':
		case 'cooler':
			secId = el.sectionId
			break
		case 'aggregate':
			bldId = el.buildingId
			break
		case 'valve':
			secId = el.sectionId
			v = value[_id]?.close ? 'cls' : 'opn'
			break
		case 'heating':
			el.owner.type == 'section' ? (secId = el.owner.id) : (clrId = el.owner.id)
			break
		default:
			break
	}
	if (secId && !bldId) bldId = getIdSB(section, secId)

	return {
		bldId,
		secId,
		clrId, // только у heating
		id: el._id,
		value: v ? v : value[el._id]?.state,
	}
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
 * Логирование неисправностей
 * @param {object[]} arr массив текущих неисправностей
 * @param {object} prev хранилище прошлого значения
 */
function alarmLog(arr) {
	arr.forEach((el) => {
		const message ={ bldId:'', value: el.title + ' ' + el.msg}
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
			logger['sensor']({ message: { bldId:bld._id, type: el, state: val[el]?.state, value: val[el]?.[m] } })
		})
	})
}
module.exports = { pLog, alarmLog, sensLog }

/**
 * Логирование клапана по концевикам
 * @param {*} _id
 * @param {*} val
 * @param {*} prev
 */
function valve(_id, val, prev) {
	val?.close ? logger['valve']({ _id, message: { state: 'cls' } }) : logger['valve']({ _id, message: { state: 'opn' } })
}
