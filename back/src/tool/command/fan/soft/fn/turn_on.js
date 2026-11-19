const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const _MIN_SP = 20

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} idB Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fanFC, fans, solHeat, idB, acc, s, max, off, isCC, where) {
	const _MAX_SP = s?.fan?.maxsp ?? 100
	// Флаг = сигнал на выключение && комби-холодильник && релейные ВНО выключены &&
	// && ПЧ на минимальном задании
	const offCC = off && isCC && acc.order < 0 && acc.fc.sp <= _MIN_SP
	// Запрет управления секционными ВНО: комби-склад в режиме обычного и Настройка
	// "Использовать вентиляторы секции при работе холодильного оборудования" = ВЫКЛ
	const onFan = isCC && s?.coolerCombi?.onFan === false && where === 'cold'
	if (fanFC) {
		if (max === -1 || offCC || onFan) {
			ctrlAO(fanFC, idB, _MIN_SP)
			ctrlDO(fanFC, idB, 'off')
			// console.log(113, 'ВЫКЛ ПЧ', max, offCC)
		} else {
			ctrlAO(fanFC, idB, acc.fc.sp)
			ctrlDO(fanFC, idB, acc.fc.value ? 'on' : 'off')
			// console.log(114, 'ПЧ', max === -1, offCC)
		}
		// console.log('\tDO ВНО ПЧ', acc.fc.value ? 'ВКЛ' : 'ВЫКЛ', 'Задание=', acc.fc.sp)
	}
	// console.log(123, fans)
	fans.forEach((f, i) => {
		// Очередь не дошла - выключить ВНО
		if (acc.order < i || offCC || onFan) {
			ctrlDO(f, idB, 'off')
			f?.ao?.id ? ctrlAO(f, idB, _MIN_SP) : null
			// console.log('\tDO ВНО', f.name, 'ВЫКЛ')
			return
		}
		// Отключаем вентиляторы испарителей в вентилируемом складе,
		// если настройка "Холодильник С - Использовать вентиляторы
		// испарителей при работе уличным воздухом" = ВЫКЛ
		const onFanCooler =
			s?.coolerCombi?.onFanCooler === true && !isCC && f.owner.type == 'cooler'
		if (f.owner.type != 'cooler' || onFanCooler) {
			// Включить ВНО секции, испарителя
			ctrlDO(f, idB, 'on')
			f?.ao?.id ? ctrlAO(f, idB, _MAX_SP) : null
		} else {
			// Выключить ВНО испарителя
			ctrlDO(f, idB, 'off')
			f?.ao?.id ? ctrlAO(f, idB, _MIN_SP) : null
		}
	})

	solHeat.forEach((el) => {
		if (offCC) {
			ctrlDO(el, idB, 'off')
			return
		}
		ctrlDO(el, idB, acc.solh.value ? 'on' : 'off')

		// console.log('\tDO соленоиды подгрева', el.name, acc.solh.value ? 'ВКЛ' : 'ВЫКЛ')
	})
}

module.exports = turnOn
