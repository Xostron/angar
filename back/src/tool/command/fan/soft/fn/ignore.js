const { data: store, readAcc } = require('@store')
const { isAlr } = require('@tool/message/auto')
const { ctrlDO } = require('@tool/command/module_output')

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
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Управление ВНО: склад нормальный, режим сушка, удаление СО2, режим охлаждения и отключено оборудование,
	// комби склад без аварии авторежима
	if (
		bld.type == 'normal' ||
		bdata.automode != 'cooling' ||
		extraCO2.start ||
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
	// 1. Игнор работы ВНО: если удаление СО2, выкл.оборудование испарителей
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	if (extraCO2.start || (bdata.automode === 'cooling' && !s?.coolerCombi?.on)) {
		// Отключение соленоидов подогрева
		fnSol(bld._id, extraCO2, solHeat)
		console.log('\tИгнор (cold) удаление СО2+выкл сол. подогрева - true')
		return true
	}
	// Если есть авария авторежима то - разрешить управление
	const alrAuto = isAlr(bld._id, bdata.automode)
	console.log('\tИгнор (cold)', !alrAuto)
	return !alrAuto
}

// Отключение соленоидов
function fnSol(idB, extraCO2, sol) {
	if (!extraCO2.sol) return
	sol.forEach((el) => ctrlDO(el, idB, 'off'))
}

module.exports = { normal, cold }
