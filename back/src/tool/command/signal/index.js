const signaltype = require('@dict/signal')
const { puIO } = require('@tool/in_out')
const { getIdBS } = require('@tool/get/building')
const { debDI } = require('@tool/sensor/debounce')
const { data: store } = require('@store')

/**
 * Получить раму сигнала
 * @param {*} ownerId 
 * @param {*} obj 
 * @param {*} type 
 * @returns 
 */
function getSig(ownerId, obj, type) {
	return obj.data?.signal?.find((o) => o.owner.id === ownerId && o.type == type) ?? null
}

/**
 * Получить значение сигнала
 * @param {*} ownerId Владелец сигнала: склад/секция
 * @param {*} obj
 * @param {*} type
 * @returns
 */
function getSignal(ownerId, obj, type) {
	const t = getSig(ownerId, obj, type)
	return obj.value?.[t?._id] ?? null
}

// Получить сигнал (авария двигателя) вентилятора
function getSignalFan(fanId, obj) {
	return obj.value?.[fanId]?.qf
}

// Получить значения сигналов по sectionId
function getSignalList(buildingId, obj, type) {
	// Секции склада
	const section = obj.data.section.filter((el) => el.buildingId == buildingId)
	const signal = []
	for (const s of section) {
		signal.push(...obj.data.signal.filter((el) => el.owner.id == s._id && el.type == type))
	}
	return signal
}

// Сигналы клапана: концевики и авария двиг
function sigValve(sig, val, result, module, retain) {
	switch (sig.type) {
		case 'on':
		case 'off': {
			const type = sig.type === 'on' ? 'open' : 'close'
			result[sig.owner.id] ??= {}
			result[sig.owner.id][type] = puIO(val, sig.module.id, sig.module.channel)
			break
		}
		// Сигнал питания двигателя клапана
		case 'vlvCrash': {
			const value = puIO(val, sig.module.id, sig.module.channel)
			result[sig._id] = value
			result[sig.owner.id] ??= {}
			result[sig.owner.id].crash = value
			break
		}
		default:
			break
	}
}

// Напорный вентилятор: доп контакт автомат. выключателя и состояние вентилятора
function sigFan(sig, val, result, module, retain, fan) {
	switch (sig.type) {
		// Автомат выбит
		case 'fan': {
			result[sig.owner.id] ??= {}
			result[sig.owner.id].qf = puIO(val, sig.module.id, sig.module.channel)
			break
		}
		// Перегрев статора
		case 'fanh': {
			result[sig.owner.id] ??= {}
			result[sig.owner.id].heat = puIO(val, sig.module.id, sig.module.channel)
			break
		}
		default:
			break
	}
}

// Другие сигналы:
function sigDfl(sig, val, equip, result) {
	let value = null
	const isDO = signaltype.output.includes(sig.type)

	// Считанное значение
	value = puIO(val, sig.module.id, sig.module.channel, isDO)
	value = value === null ? value : !sig.reverse ? value : !value

	// антидребезг
	debDI(sig, value, equip, result)
}

/**
 * Найти все сигналы типа type и вернуть суммарное значение по складу и секциям
 * @param {*} idB
 * @param {*} section
 * @param {*} obj
 * @param {*} type
 * @param {} alr Значение сигнала для установки аварии (по-умолчанию true)
 */
function getSumSig(idB, obj, type, alr = true) {
	const idBS = getIdBS(obj?.data?.section, idB)
	if (!idBS.length) return null
	const arr = obj?.data?.signal?.filter((el) => idBS.includes(el.owner.id) && el.type === type)
	if (!arr.length) return null

	return alr ? arr.some((el) => obj.value?.[el._id]) : arr.every((el) => obj.value?.[el._id])
}

/**
 * Найти все сигналы типа type и вернуть суммарное значение по складу
 * @param {*} idB
 * @param {*} obj
 * @param {*} type
 * @param {} alr Значение сигнала для установки аварии (true без инверсии, false - с инверсией)
 * @returns
 */
function getSumSigBld(idB, obj, type, alr = true) {
	const arr = obj.data?.signal?.filter((el) => el.owner.id === idB && el.type == type) ?? null
	if (!arr.length) return !alr
	return alr ? arr.some((el) => obj.value?.[el._id]) : arr.every((el) => obj.value?.[el._id])
}

module.exports = {
	getSig,
	getSignal,
	getSignalFan,
	getSignalList,
	sigValve,
	sigFan,
	sigDfl,
	getSumSig,
	getSumSigBld,
}
