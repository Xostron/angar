const { data: store } = require('@store')
const fn_1 = require('./fn_1')
const fn_2 = require('./fn_2')

/**
 * Управление выходом "Сброс аварии" для дезактиввации реле низкой температуры
 * п1. Нажатие на кнопку и первый цикл программы - включает все выходы "Сброса аварии"
 * п2. Автосброс аварии закрытия клапанов (включение конкретного выхода "Сброса аварии,
 * например: имеется авар. закр. клапанов на секции 2, при срабатывании автосброса, включится
 * выход "Сброса аварии" секции 2, остальные будут не аактивны
 * Примечание:
 * - При нажатии на кнопку аварии сами очищаются в обработчиках кнопки
 * - при автосбросе включается только выход
 * @param {*} bld
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} alarm
 * @param {*} acc
 * @param {*} data
 * @param {*} ban
 */
function resetDO(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// п1
	fn_1(bld, m, acc)

	// п2
	fn_2(bld, obj, s, se, m, acc)
}

module.exports = resetDO

// /**
//  * TODO не используется
//  * Имеется DO сигнал "Модуль в сети", если модуль данного сигнала
//  * неисправен или сам сигнал был выключен, то вырабатывается
//  * импульс на включение выхода "Сброс аварии"
//  * @param {*} obj
//  * @param {*} bld
//  * @param {*} m
//  * @param {*} acc
//  * @returns
//  */
// function connect(obj, bld, m) {
// 	if (!m?.connect?.length) return
// 	let reset = false
// 	// Перебор сигналов "Модуль в сети"
// 	m.connect.forEach((el) => {
// 		const sig = obj.value?.[el._id]
// 		const idM = el.module?.id
// 		const isErr = isErrM(bld._id, idM)
// 		// Неисправен модуль данного сигнала || сигнал выключен
// 		if (isErr || !sig) reset = true
// 	})
// 	return reset
// }
