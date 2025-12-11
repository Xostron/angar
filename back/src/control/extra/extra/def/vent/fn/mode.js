const { delUnused } = require('@tool/command/extra')

/**
 * Выбор алгоритма ВВ
 * 1. Режим Вкл (для обычного и комби в режиме обычного)
 * 2. Режим Авто
 * - Выравнивание температуры (для обычного и комби в режиме обычного)
 * - по таймеру (для обычного и комби в режиме обычного)
 * - по таймеру (для комби в режиме холодильника)
 * Примечание:
 * - режим Выкл выполняется в exit (только для обычного и комби в режиме обычного)
 * @param {*} bld
 * @param {*} sect
 * @param {*} prepare
 * @param {*} acc
 */
function fnMode(prepare, s, acc) {
	const { isCC, isCN, isN } = prepare
	// Обычный, комби-обычный. Режим ВВ Выкл
	if ((isN || isCN) && (s?.vent?.mode === 'off' || !s?.vent?.mode)) return 'off'
	// Обычный, комби-обычный. Режим ВВ Вкл
	if ((isN || isCN) && s?.vent?.mode === 'on') return 'on'
	// Обычный, комби-обычный. Режим ВВ авто. Выберется по времени
	if ((isN || isCN) && s?.vent?.mode === 'auto') return 'time'
	// Комби-холод.
	if (isCC) return 'combiCold'
	return null
}

// Сообщения режимы работы вентиляции
/**
 *
 * @param {*} bld Склад
 * @param {*} acc Аккумулятор
 * @param {*} code Код выбранного алгоритма из fnSelect
 */
function fnModeMsg(bld, code, acc) {
	// let key
	switch (code) {
		case null:
		case 'off':
			key = 144
			break
		case 'on':
			key = 145
			break
		case 'time':
			// case 'dura':
			key = 146
			break
		case 'combiCold':
			key = 147
			break
	}
	const arrCode = ['off', 'ventOn', 'time', 'combiCold']
	delUnused(arrCode, code, bld, key, 'vent')
}

module.exports = { fnMode, fnModeMsg }
