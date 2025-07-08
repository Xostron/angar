const { ctrlAO, ctrlDO } = require('@tool/command/module_output')

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} idB Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fanFC, fans, idB, acc) {
	if (fanFC) {
		ctrlAO(fanFC, idB, acc.fc)
		ctrlDO(fanFC, idB, 'on')
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
	})
}

module.exports = turnOn
