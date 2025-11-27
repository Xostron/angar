const { delUnused } = require('@tool/command/extra')
const { delExtra} = require('@tool/message/extra')


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
	const { extraCO2, am, isCC, isCN, isN } = prepare
	const a = am === 'drying' && s?.drying?.ventilation === true
	// Обычный, комби-обычный. Режим ВВ Выкл
	if ((isN || isCN) && (s?.vent?.mode === 'off' || !s?.vent?.mode)) return 'off'
	// Обычный, комби-обычный. Режим ВВ Вкл
	if ((isN || isCN) && s?.vent?.mode === 'on') return 'on'
	// Обычный, комби-обычный. Режим ВВ авто. После отработки подхвата. Выберется по времени
	if ((isN || isCN) && s?.vent?.mode === 'auto' && acc.byTime?.allow) return 'time'
	// Обычный, комби-обычный. Режим ВВ авто. Выберется подхват
	if ((isN || isCN) && s?.vent?.mode === 'auto') return 'dura'
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
function fnModeMsg(bld, acc, code) {
	console.log(771, acc.lastMode, code)
	if (acc.lastMode !== code) {
		acc.lastMode = code
		let key
		switch (code) {
			case null:
				break
			case 'off':
				key = 144
				break
			case 'on':
				key = 145
				break
			case 'time':
			case 'dura':
				key = 146
				break
			case 'combiCold':
				key = 147
				break
		}
		if (code === null) {
			delExtra(bld._id, null, 'vent', 'off')
			delExtra(bld._id, null, 'vent', 'on')
			delExtra(bld._id, null, 'vent', 'time')
			delExtra(bld._id, null, 'vent', 'dura')
			delExtra(bld._id, null, 'vent', 'combiCold')
			return
		}
		const arrCode = ['off', 'on', 'dura', 'time', 'combiCold']
		delUnused(arrCode, code, bld, key, 'vent')
	}
}

module.exports = { fnMode, fnModeMsg }
