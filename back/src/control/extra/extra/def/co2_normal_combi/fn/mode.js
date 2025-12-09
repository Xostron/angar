const { delUnused } = require('@tool/command/extra')

/**
 * Выбор алгоритма ВВ
 * 1. Режим Выкл (для обычного и комби в режиме обычного)
 * 2. Режим Вкл (для обычного и комби в режиме обычного)
 * 3. Режим по времени
 * 4. Режим по датчику СО2
 * 5. Комби-холодильник - СО2 выкл
 * Примечание:
 * - режим Выкл выполняется в exit
 * @param {*} bld
 * @param {*} sect
 * @param {*} prepare
 * @param {*} acc
 */
function fnMode(prepare, s, acc) {
	const { isCC, isCN, isN } = prepare
	// Обычный, комби-обычный. Режим ВВ Выкл
	if ((isN || isCN) && (s?.co2?.mode === 'off' || !s?.co2?.mode)) return 'off'
	// Обычный, комби-обычный. Режим ВВ Вкл
	if ((isN || isCN) && s?.co2?.mode === 'on') return 'on'
	// Обычный, комби-обычный. Режим ВВ время. Выберется по времени
	if ((isN || isCN) && s?.co2?.mode === 'time') return 'time'
	// Обычный, комби-обычный. Режим ВВ время. Выберется по времени
	if ((isN || isCN) && s?.co2?.mode === 'sensor') return 'sensor'
	// Комби-холод.
	if (isCC) return null
	return null
}

function fnModeMsg(bld, acc, s) {
	switch (code) {
		case null:
		case 'off':
			key = 61
			break
		case 'on':
			key = 62
			break
		case 'time':
			key = 63
			break
		case 'sensor':
			key = 64
			break
	}
	const arrCode = ['off', 'on', 'time', 'sensor']
	delUnused(arrCode, code, bld, key, 'co2')
}

module.exports = { fnMode, fnModeMsg }

// if (acc.lastMode !== s?.co2?.mode) {
// 	delete acc.work
// 	delete acc.wait
// 	delete acc.start
// 	acc.lastMode = s?.co2?.mode
// 	let code
// 	switch (s?.co2?.mode) {
// 		case 'off':
// 		case null:
// 			code = 61
// 			acc.message = ''
// 			break
// 		case 'on':
// 			code = 62
// 			acc.message = '(постоянно)'
// 			break
// 		case 'time':
// 			code = 63
// 			acc.message = `(${s.co2.work / 60 / 1000}мин)`
// 			break
// 		case 'sensor':
// 			acc.message = '(по датчику)'
// 			code = 64
// 			break
// 	}
// 	const arr = [null, 'off', 'on', 'sensor', 'time']
// 	delUnused(arr, s?.co2?.mode, bld, code, 'co2')
// }
// if (acc.start) wrExtra(bld._id, null, 'co2', msgB(bld, 84, acc.message), 'co2work')
// else delExtra(bld._id, null, 'co2', 'co2work')
