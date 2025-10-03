const { biDO, uniDO } = require('@tool/in_out')
/**
 * outputEq - Значения выходов (вкд/выкл исполнительный механизм ИМ)
 * Клапан, вентилятор, обогрев клапанов, соленоид
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @returns id_ИМ : value_DO
 * Здесь добавлять дискретные ИМ
 */
function outputEq(equip, val) {
	const { valve, fan, heating, cooler, binding, device } = equip
	let r = {
		...biDO(valve, val),
		...uniDO(fan, val),
		...uniDO(heating, val),
		...fnSolenoid(cooler, binding, val),
		...fnDevice(device, binding, val),
	}
	return r
}

module.exports = outputEq

// Выход: соленоиды холодильника
function fnSolenoid(cooler, binding, val) {
	let solenoid = {}
	cooler.forEach((el) => {
		const sol = el?.solenoid?.map((s) => {
			const b = binding.find((e) => e.owner.id === s?._id)
			return { ...s, module: { id: b.moduleId, channel: b.channel } }
		})
		solenoid = { ...solenoid, ...uniDO(sol, val) }
	})
	// console.log(555, solenoid)
	return solenoid
}

// Выход: устройства
function fnDevice(device, binding, val) {
	const arr = device.map((doc) => {
		const b = binding.find((el) => el.owner.id === doc?._id)
		doc.module ??= {}
		doc.module.id = b?.moduleId
		doc.module.channel = b?.channel
		return doc
	})
	return uniDO(arr, val)
}
