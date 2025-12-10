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

function fnModeMsg(bld, code, acc) {
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
