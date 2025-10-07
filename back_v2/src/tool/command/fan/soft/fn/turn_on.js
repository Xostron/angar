const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const _MAX_SP = 100
const _MIN_SP = 20

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} idB Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fanFC, fans, solHeat, idB, acc) {
	if (fanFC) {
		ctrlAO(fanFC, idB, acc.fc.sp)
		ctrlDO(fanFC, idB, acc.fc.value ? 'on' : 'off')
	}

	fans.forEach((f, i) => {
		// Очередь не дошла - выключить ВНО
		if (acc.order < i) {
			ctrlDO(f, idB, 'off')
			f?.ao?.id ? ctrlAO(f, idB, _MIN_SP) : null
			return
		}
		// Включить ВНО
		ctrlDO(f, idB, 'on')
		f?.ao?.id ? ctrlAO(f, idB, _MAX_SP) : null
	})
	solHeat.forEach((el) => {
		ctrlDO(el, idB, acc.sol.value ? 'on' : 'off')
	})
}

module.exports = turnOn
