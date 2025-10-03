const signaltype = require('@dict/signal')
const { puIO } = require('@tool/in_out')

// Получить значение сигнала
function getSignal(ownerId, obj, type) {
	const t = obj.data?.signal?.find((o) => o.owner.id === ownerId && o.type == type) ?? null
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
function sigDfl(sig, val, result) {
	let value = null
	if (!signaltype.output.includes(sig.type)) value = puIO(val, sig.module.id, sig.module.channel)
	if (signaltype.output.includes(sig.type))
		value = puIO(val, sig.module.id, sig.module.channel, true)
	result[sig._id] = value === null ? value : !sig.reverse ? value : !value
}

module.exports = { getSignal, getSignalFan, getSignalList, sigValve, sigFan, sigDfl }
