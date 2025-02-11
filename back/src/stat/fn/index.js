const logger = require('@tool/logger')
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
	arr.forEach((el) => logger[level]({ message: message(data, el, level, value) }))
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
			let m
			if (el === 'hin') m = 'max'
			if (el === 'tprdL') m = 'min'
			if (el === 'tin' && bld.type === 'cold') m = 'max'
			else return
			logger['sensor']({
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

/**
 *
 */
function sensLog(data) {
	pLogConst(data, data.sensor, store.value, 'sensor')
}

/**
 * Логирование критических неисправностей
 * @param {object[]} arr массив актуальных аварий
 * @param {object} prev Аккумулятор: аварии которые уже залогированы
 */
function alarmLog(arr) {
	store.prev.critical ??= {}
	// Логирование новых аварий (value: true)
	arr.forEach((el) => {
		const message = { uid: el.uid, bldId: el.buildingId, title: el.title + ' ' + el.msg, value: true }
		// авария уже была залогирована - выход
		if (el.date === store.prev.critical[el.uid]?.date) return
		// фиксируем аварию как залогированную
		store.prev.critical[el.uid] = el
		logger['alarm']({ message })
	})

	// Логирование ухода аварий (value: false)
	for (const key in store.prev.critical) {
		const r = arr.find((el) => el.uid == key)
		// авария найдена в списке актуальных - выход
		if (r) continue
		// Авария не найдена в актуальных - авария сброшена
		// (логируем уход аварии, и удаляем из аккумулятора запись об аварии)
		const o = store.prev.critical[key]
		const message = { uid: o.uid, bldId: o.buildingId, title: o.title + ' ' + o.msg, value: false }
		logger['alarm']({ message })
		delete store.prev.critical[key]
	}
}

/**
 * Логирование информационных сообщений
 * @param {object[]} arr массив текущих сообщений
 * @param {object} prev хранилище прошлого значения
 */
function eventLog(arr) {
	arr.forEach((el) => {
		const message = { bldId: el.buildingId, value: el.title + ' ' + el.msg }
		if (el.date === store.prev[message.value]) return
		// фиксируем состояние по изменению
		store.prev[message.value] = el.date
		// logger['alarm']({ message })
	})
}

function activityLog() {}

module.exports = { pLog, alarmLog, sensLog, sensTotalLog, pLogConst, eventLog, activityLog }
