const { logger, loggerSens, loggerWatt, loggerEvent } = require('@tool/logger')
const { data: store } = require('@store')
const { getIdSB, getOwnerClr } = require('@tool/command/building')

/**
 * Логирование периферии
 * @param {string[]} section Рама секций
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

// Лог непрерывных значений
function pLogConst(data, arr, value, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		switch (level) {
			case 'sensor':
				loggerSens[level]({ message: message(data, el, level, value) })
				break
			case 'watt':
				loggerWatt['watt']({ message: message(data, el, level, value) })
				break
			default:
				logger['watt']({ message: message(data, el, level, value) })
				break
		}
	})
}

/**
 * Сохранение изменений
 * @param {object} val значение
 */
function fnPrev(id, val, level) {
	switch (level) {
		case 'watt':
			store.prev[id] = [val.Pa, val.Pb, val.Pc]
			break

		default:
			store.prev[id] = val
			break
	}
}
/**
 * Данные для записи в логи
 * @param {object} data Рама
 * @param {object} el Элемент рамы
 * @param {string} level Уровень лога (Имя лог файла)
 * @param {object} value Глобальный объект со значениями склада
 * @returns
 */
function message(data, el, level, value) {
	const { section, cooler } = data
	let secId, bldId, clrId, v, state
	//
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
			secId = el.sectionId?.[0]
			v = value[el._id]?.close ? 'cls' : 'opn'
			break
		case 'heating':
			el.owner.type == 'section' ? (secId = el.owner.id) : (clrId = el.owner.id)
			v = value[el._id] ?? false
			break
		case 'watt':
			secId = el.sectionId
			v = value[el._id].Pa + value[el._id].Pb + value[el._id].Pc
			// console.log(222, v)
			break
		case 'sensor':
			el.owner.type == 'section' ? (secId = el.owner.id) : (bldId = el.owner.id)
			v = value[el._id].value
			state = value[el._id].state
			break
		default:
			break
	}

	if (secId && !bldId) bldId = getIdSB(section, secId)
	const o = clrId ? getOwnerClr(section, cooler, clrId) : {}

	return {
		bldId: bldId ?? o.bldId,
		secId: secId ?? o.secId,
		clrId, // только у heating?
		id: el._id,
		value: v !== undefined ? v : value[el._id]?.state,
		state, // только у датчиков
		type: el?.type,
	}
}

/**
 * Разрешение на запись в логи
 * @param {object} val состояние
 * @returns {boolean}
 */
function check(val, prev, level) {
	// Значение состояния
	if (val === undefined) return false
	let v
	switch (level) {
		case 'watt':
			v = [val.Pa, val.Pb, val.Pc]
			break
		default:
			v = val
	}
	// Состояние не изменилось
	if (JSON.stringify(v) === JSON.stringify(prev)) return false
	return true
}

/**
 * Логирование датчиков (по total)
 * hin Влажность продукта max (обычный склад)
 * tprdL Температура продукта (обычный склад)
 * tin температура потолка (холодильный склад)
 * @param {object} total Расчетные данные с анализа (мин,макс датчиков)
 * @param {object[]} building Рама складов
 */
function sensTotalLog(total, building) {
	if (!total) return
	building.forEach((bld) => {
		const val = total[bld._id]
		;['hin', 'tprdL', 'tin'].forEach((el) => {
			const m = checkTyp(el, bld)
			if (!m) return
			loggerSens['sensor']({
				message: {
					bldId: bld._id,
					type: el,
					state: val[el]?.state,
					value: val[el]?.[m],
				},
			})
		})
	})
}

function checkTyp(el, bld) {
	if (el === 'hin') return 'max'
	if (el === 'tprdL') return 'min'
	if (el === 'tin' && bld.type === 'cold') return 'max'
	return null
}

/**
 * Логирование информационных сообщений
 * @param {object[]} arr массив текущих сообщений
 * @param {object} prev хранилище прошлого значения
 */
function historyLog(arr, prev, level) {
	if (!level) return
	// Логирование новых событий (value: true)
	arr.forEach((el) => {
		const message = { uid: el.uid, bldId: el.buildingId, title: (el.title + ' ' + el.msg).trim(), value: true }
		// Событие было залогировано - выход
		if (el.date === prev[el.uid]?.date) return
		// фиксируем событие как залогированную
		prev[el.uid] = el
		loggerEvent[level]({ message })
	})

	// Логирование ухода аварий (value: false)
	for (const key in prev) {
		const r = arr.find((el) => el.uid == key)
		// авария найдена в списке актуальных - выход
		if (r) continue
		// Авария не найдена в актуальных - авария сброшена
		// (логируем уход аварии, и удаляем из аккумулятора запись об аварии)
		const o = prev[key]
		const message = { uid: o.uid, bldId: o.buildingId, title: (o.title + ' ' + o.msg).trim(), value: false }
		loggerEvent[level]({ message })
		delete prev[key]
	}
	// if (level === 'event') console.log(111, level, Object.keys(prev).length, Object.keys(store.prev.event).length, prev, 2222, arr)
}

module.exports = { pLog, sensTotalLog, pLogConst, historyLog }
