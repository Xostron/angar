const { data: store, readAcc } = require('@store')
const { isAlr } = require('@tool/message/auto')
const { ctrlDO } = require('@tool/command/module_output')
const { isExtra } = require('@tool/message/extra')

/**
 * normal - обычный склад и комби-обычный
 * cold - комби (режим холодильник)
 *
 * Для комбинированного склада: игнорировать управление ВНО, в следующих сценариях:
 * 1. После перехода из обычного в холодильный режим и наоборот
 * 2. Удаление СО2 (логика управления ВНО холодильного режима меняется на логику обычного склада)
 * @param {*} bld Склад
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns false - разрешить управление, true - запрет управления
 */
function normal(bld, obj, s, acc, bdata) {
	// Удаление co2 в работе
	const CO2work = isExtra(bld._id, null, 'co2', 'work')
	// Управление ВНО: склад нормальный, режим сушка, удаление СО2, режим охлаждения и отключено оборудование,
	// комби склад без аварии авторежима
	if (
		bld.type == 'normal' ||
		bdata.automode != 'cooling' ||
		CO2work ||
		(bdata.automode === 'cooling' && !s?.coolerCombi?.on)
	) {
		console.log('\tИгнор (normal) false')
		return false
	}
	// Игнорирование работы ВНО: если комби склад с аварией авторежима + вкл оборудование
	const alrAuto = isAlr(bld._id, bdata.automode)
	console.log('\tИгнор (normal)', alrAuto)
	return alrAuto
}

// Комби-холодильник
function cold(bld, obj, s, acc, bdata, solHeat) {
	// 1. Игнор работы ВНО: если удаление СО2, выкл.оборудование испарителей (хранение), сушка
	// Удаление co2 в работе
	const CO2work = isExtra(bld._id, null, 'co2', 'work')
	if (
		CO2work ||
		(bdata.automode === 'cooling' && !s?.coolerCombi?.on) ||
		bdata.automode === 'drying'
	) {
		// Отключение соленоидов подогрева
		fnSol(bld._id, CO2work, solHeat)
		console.log('\tИгнор (cold) удаление СО2+выкл сол. подогрева - true')
		return true
	}
	// Если есть авария авторежима то - разрешить управление
	const alrAuto = isAlr(bld._id, bdata.automode)
	console.log('\tИгнор (cold)', !alrAuto)
	return !alrAuto
}

// Отключение соленоидов
function fnSol(idB, CO2work, sol) {
	// if (!extraCO2.sol) return
	sol.forEach((el) => ctrlDO(el, idB, 'off'))
}

module.exports = { normal, cold }
