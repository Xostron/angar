const { stateF } = require('@tool/command/fan')
const { data: store } = require('@store')
const { getIdByClr } = require('@tool/get/building')

// Испаритель
function cooler(equip, val, retain, result) {
	const { cooler, sensor, fan, heating, binding, section, signal } = equip
	cooler.forEach((clr) => {
		// fan
		result[clr._id] ??= {}
		result[clr._id].solenoid ??= {}
		result[clr._id].fan ??= {}
		result[clr._id].heating ??= {}
		result[clr._id].sensor ??= {}

		// Соленоид - добавление холода
		clr.solenoid.forEach((el) => {
			const sigId = signal.find((e) => e.owner.id === el._id)?._id

			if (result?.[sigId] === undefined) {
				console.log('src\\control\\analysis\\value\\periphery\\fn\\cooler.js', 'Нет сигнала от соленоида используем альтернативу')
				result[clr._id].solenoid[el._id] = result?.outputEq?.[el._id]
			} else result[clr._id].solenoid[el._id] = result?.[sigId]
		})

		// Напорные вентиляторы
		fan.filter((el) => el.owner.id === clr._id).forEach((f) => {
			result[clr._id].fan[f._id] = result[f._id]
		})

		// Оттайка испарителя
		heating
			.filter((el) => el.owner.id === clr._id)
			.forEach((h) => {
				result[clr._id].heating[h._id] = result?.outputEq?.[h._id]
			})

		// Датчики
		sensor
			.filter((el) => el.owner.id === clr._id)
			.forEach((s) => {
				result[clr._id].sensor[s.type] = result[s._id]
			})

		// Состояние испарителя
		const idB = getIdByClr(section, clr)
		result[clr._id].state = state(result[clr._id])
		// Аккумулятор авторежима
		if (store.acc?.[idB]?.cold?.state?.add) result[clr._id].state += '-add'
		//Добавление читаемого названия состояния
		result[clr._id].name = coolerDef[result[clr._id]?.state] ?? ''
	})
}
module.exports = cooler

function state(o) {
	const { solenoid, fan, heating } = o
	const s = Object.values(solenoid ?? {}).some((el) => !!el) ?? false
	const f = Object.values(fan ?? {}).some((el) => el?.state === 'run') ?? false
	const h = Object.values(heating ?? {}).some((el) => !!el) ?? false
	const state = [s, f, h].map((el) => (el ? 'on' : 'off'))
	return state.join('-')
}

const coolerDef = {
	'on-on-off': 'Охлаждение',
	'on-off-off': 'Набор холода',
	'off-on-off': 'Вентилятор',
	'off-off-on': 'Оттайка',
	'off-off-off': 'Пауза',
	'off-off-off-add': 'Слив',
}
