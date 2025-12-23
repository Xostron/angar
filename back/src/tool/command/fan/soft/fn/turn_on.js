const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const _MAX_SP = 100
const _MIN_SP = 20

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} idB Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fanFC, fans, solHeat, idB, acc, max, off, isCC) {
	const offCC = off && isCC
	if (fanFC) {
		if (max === -1 || offCC) {
			ctrlAO(fanFC, idB, _MIN_SP)
			ctrlDO(fanFC, idB, 'off')
			// console.log(113, 'ВЫКЛ ПЧ', max === -1)
		} else {
			ctrlAO(fanFC, idB, acc.fc.sp)
			ctrlDO(fanFC, idB, acc.fc.value ? 'on' : 'off')
			// console.log(114, 'ПЧ', max === -1, offCC)
		}
		// console.log('\tDO ВНО ПЧ', acc.fc.value ? 'ВКЛ' : 'ВЫКЛ', 'Задание=', acc.fc.sp)
	}

	fans.forEach((f, i) => {
		// Очередь не дошла - выключить ВНО
		if (acc.order < i || offCC) {
			ctrlDO(f, idB, 'off')
			f?.ao?.id ? ctrlAO(f, idB, _MIN_SP) : null
			// console.log('\tDO ВНО', f.name, 'ВЫКЛ')
			return
		}
		// Включить ВНО
		ctrlDO(f, idB, 'on')
		f?.ao?.id ? ctrlAO(f, idB, _MAX_SP) : null
		// console.log('\tDO ВНО', f.name, 'ВКЛ')
	})
	solHeat.forEach((el) => {
		if (offCC) {
			ctrlDO(el, idB, 'off')
			return
		}
		ctrlDO(el, idB, acc.sol.value ? 'on' : 'off')

		// console.log('\tDO соленоиды подгрева', el.name, acc.sol.value ? 'ВКЛ' : 'ВЫКЛ')
	})
}

module.exports = turnOn
