const { sigValve, sigFan, sigDfl } = require('@tool/command/signal')

/**
 * Дискретные входа (DI): Концевики клапана, автомат вентилятора
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} result результат
 */
function signal(equip, val, retain, result) {
	const { signal, module, fan, valve } = equip
	// console.log(equip)
	for (const o of signal) {
		switch (o.owner.type) {
			case 'valve':
				sigValve(o, val, result, module, retain, valve)
				break
			case 'fan':
				sigFan(o, val, result, module, retain, fan)
				break
			default:
				sigDfl(o, val, equip, result)
				break
		}
	}

}

module.exports = signal
