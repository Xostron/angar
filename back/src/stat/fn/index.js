const { data: store } = require('@store')
const { getIdSB, getOwnerClr } = require('@tool/get/building')
// Границы, пороги, правила для проверки величин
const hyst = {
	voltage: {
		delta: 10,
		// min: 375,
		// max: 440,
		min: 190,
		max: 250,
	},
}

// Были ли изменения между предыдущим и текущим показателями
// true - есть изменения
function isChanged(v, vprev, level) {
	switch (level) {
		case 'voltage':
			// Прошлые значение не инициализированы -> фиксируем как изменения
			// if (vprev.every((el) => el === undefined)) return true
			// Прошлые значения есть, проверка границ 10В, или мин/макс порог
			return v.some((cur, i) => cur <= hyst.voltage.min || cur >= hyst.voltage.max)
			// проверка границ 10В (отключено)
			return v.some(
				(cur, i) =>
					cur > vprev[i] + hyst.voltage.delta ||
					cur < vprev[i] - hyst.voltage.delta ||
					cur <= hyst.voltage.min ||
					cur >= hyst.voltage.max,
			)
		case 'watt':
		case 'valve':
		case 'cooler':
		case 'fan':
			if (JSON.stringify(v) === JSON.stringify(vprev)) return false
			return true
		default:
			if (JSON.stringify(v) === JSON.stringify(vprev)) return false
			return true
	}
}

/**
 * Сохранение изменений
 * @param {object} val значение
 */
function fnPrev(id, val, level) {
	switch (level) {
		case 'voltage':
			store.prev[id] = [val?.Ua, val?.Ub, val?.Uc]
			break
		case 'watt':
			store.prev[id] = [val?.Pa, val?.Pb, val?.Pc]
			break
		case 'cooler':
			store.prev[id] = val?.state
			break
		default:
			store.prev[id] = val
			break
	}
}

/**
 * Разрешение на запись в логи
 * @param {object} val состояние
 * @returns {boolean} false - состояние не изменилось,  true - изменилось
 */
function check(val, prev, level) {
	// Значение состояния
	if (val === undefined) return false
	let v, vprev
	switch (level) {
		case 'voltage':
			v = [val?.Ua, val?.Ub, val?.Uc]
			vprev = prev ?? []
			break
		case 'watt':
			v = [val?.Pa, val?.Pb, val?.Pc]
			vprev = prev ?? []
			break
		case 'valve':
			v = [val?.open, val?.close]
			vprev = [prev?.open, prev?.close]
			break
		case 'cooler':
			v = val.state
			vprev = prev
			break
		case 'fan':
			v = { state: val?.state }
			vprev = { state: prev?.state }
			break
		default:
			v = val
			vprev = prev
	}

	return isChanged(v, vprev, level)
}

function checkTyp(el, bld) {
	if (el === 'hin') return 'max'
	if (el === 'tprdL') return 'min'
	if (el === 'tin' && bld.type === 'cold') return 'max'
	return null
}

module.exports = { fnPrev, check, checkTyp }
