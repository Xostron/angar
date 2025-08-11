const { data: store, readAcc } = require('@store')
const { isAlr } = require('@tool/message/auto')
const { ctrlDO } = require('@tool/command/module_output')

/**
 * normal - обычный склад и комби(режим обычный)
 * cold - комби (режим холодильник)
 *
 * Для комбинированного склада: игнорировать управление ВНО, в следующих сценариях:
 * 1. При переходе из обычного в холодильный режим и наоборот
 * 2. Удаление СО2 (логика управления ВНО холодильного режима меняется на логику обычного склада)
 * @param {*} bld Склад
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns false - разрешить управление, true - запрет управления
 */
function normal(bld, obj, acc, bdata) {
	console.log('=======================normal', acc, )
	// Удаление СО2
	const extraCO2 = readAcc(bld._id, 'building', 'co2')

	if (bld.type == 'normal' || bdata.automode != 'cooling' || extraCO2.start) {
		console.log('Работает алгоритм ВНО простого склада')
		return false
	}
	const alrAuto = isAlr(bld._id, bdata.automode)
	return alrAuto
}
function cold(bld, obj, acc, bdata, solHeat) {
	console.log('=======================cold', acc, )
	// Удаление СО2: логика холодильника -> логика обычного
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	if (extraCO2.start) {
		// Отключение соленоидов подогрева
		fnSol(bld._id, extraCO2, solHeat)
		console.log(99002, 'Соленоиды отключены, алгоритм ВНО холодильника отключен')
		return true
	}
	// Если есть авария авторежима, то логика обычного -> логика холодильника
	const alrAuto = isAlr(bld._id, bdata.automode)
	return !alrAuto
}

// Отключение соленоидов
function fnSol(idB, extraCO2, sol) {
	if (!extraCO2.sol) return
	sol.forEach((el) => ctrlDO(el, idB, 'off'))
}

module.exports = { normal, cold }
