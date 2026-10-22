const { uniDO, puIO } = require('@tool/in_out')

// Выход: соленоиды холодильника
function eqSolenoid(cooler, binding, val) {
	let solenoid = {}
	cooler.forEach((el) => {
		const sol = el?.solenoid?.map((s) => {
			const b = binding.find((e) => e.owner.id === s?._id)
			return { ...s, module: { id: b.moduleId, channel: b.channel } }
		})
		solenoid = { ...solenoid, ...uniDO(sol, val) }
	})
	return solenoid
}

// Выход: устройства управляющий сигнал, кроме электроизмерений
function eqDevice(device, binding, val) {
	const arr = device
		.filter((doc) => doc.type !== 'pui')
		.map((doc) => {
			const b = binding.find((el) => el.owner.id === doc?._id)
			doc.module ??= {}
			doc.module.id = b?.moduleId
			doc.module.channel = b?.channel
			return doc
		})
	return uniDO(arr, val)
}

function eqFlap(flap, signal, val) {
	const r = {}
	flap.forEach((el) => {
		const { hasOpen, signals } = flapVlvSig(el, signal)

		if (hasOpen === true) {
			// Заслонка клапан
			r[el._id] ??= {}
			r[el._id].close = puIO(val, el?.module?.id, el?.module?.channel, true)
			r[el._id].open = puIO(
				val,
				signals?.open?.module?.id,
				signals?.open?.module?.channel,
				true,
			)
		} else {
			// Обычная заслонка
			r[el._id] = puIO(val, el?.module?.id, el?.module?.channel, true)
		}
	})
	console.log(44, r)
	return r
}

// Заслонка клапан (имеет концевики и сигнал закрытие)
// Основной сигнал управления заслонки (db.heating) - открыть
// доп сигнал (db.signal) - закрыть
/**
 * Найти сигналы заслонки
 *
 * @param {*} el
 * @param {*} signal
 * @returns
 */
function flapVlvSig(el, signal) {
	// Сигналы заслонки
	const signals = signal
		.filter((s) => s.owner.id == el._id)
		.reduce((acc, s, i) => {
			acc[s.type] = s
			return acc
		}, {})
	// Для заслонки клапана (наличие сигнала управления закрыть)
	// возвращаем все его сигналы
	if (signals.open) return { hasOpen: true, signals }
	// Для обычной заслонки (один сигнал управления  открыть)
	return { hasOpen: false, signals }
}

module.exports = { eqSolenoid, eqDevice, flapVlvSig, eqFlap }
