const { ctrlDO } = require('@tool/command/module_output')
const { getIdB } = require('@tool/get/building')
const { setCmd } = require('@tool/command/set')

/**
 * Состояние устройств (вентиляторы, обогреватель и т.д.)
 * @param {*} id Id исполнительного механизма
 * @param {*} value Прочитанные данные с модуля
 */
function stateEq(id, value) {
	return value?.outputEq?.[id]
}

// Состояние вентилятора
function stateF(fan, equip, result, retain) {
	const idB = getIdB(fan.module?.id, equip.module)
	// Выведен из работы
	const off = retain?.[idB]?.fan?.[fan.owner.id]?.[fan._id]
	// Состояние выхода
	const out = result?.outputEq?.[fan._id]
	if (off) return 'off'
	if (result?.[fan._id]?.qf || result?.[fan._id]?.heat) return 'alarm'
	if (out) return 'run'
	return 'stop'
}

function arrCtrl(idB, arr, type) {
	arr?.forEach((el) => ctrlDO(el, idB, type))
}

module.exports = {
	stateEq,
	stateF,
	arrCtrl,
}
