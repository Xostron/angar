const { biDO, uniDO } = require('@tool/in_out')
const { eqDevice, eqSolenoid, eqFlap } = require('./fn')
/**
 * outputEq - Значения выходов (вкл/выкл исполнительный механизм ИМ)
 * Клапан, вентилятор, обогрев клапанов, соленоид
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @returns id_ИМ : value_DO
 * Здесь добавлять дискретные ИМ
 */
function outputEq(equip, val) {
	const { valve, fan, heating, cooler, binding, device, signal } = equip
	// heating - заслонки
	const flap = heating.filter((el) => el.type == 'flap')
	// Все остальные heating
	const _heating = heating.filter((el) => el.type != 'flap')
	// TODO
	let r = {
		...biDO(valve, val),
		...uniDO(fan, val),
		...uniDO(_heating, val),
		...eqFlap(flap, signal, val),
		...eqSolenoid(cooler, binding, val),
		...eqDevice(device, binding, val),
	}
	// console.log(r)
	return r
}

module.exports = outputEq
