const { ctrlAO, ctrlDO } = require('@tool/command/module_output')

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
			f?.ao?.id ? ctrlAO(f, idB, 0) : null
			return
		}
		// Включить ВНО
		ctrlDO(f, idB, 'on')
		f?.ao?.id ? ctrlAO(f, idB, 100) : null
		acc.count = acc.order
	})
	solHeat.forEach((el) => {
		ctrlDO(el, idB, acc.sol.value ? 'on' : 'off')
	})
}

module.exports = turnOn
