const { getIdB } = require('@tool/get/building')
const { setCmd } = require('@tool/command/set')
/**
 * Команда управления периферией (вкл/выкл)
 * @param {*} obj Вентилятор и т.д.
 * @param {*} buildingId Ссылка на склад
 * @param {*} type Тип команды включить/выключить (on, off)
 * @returns
 */
function ctrlB(obj, buildingId, type) {
	if (!type) return null
	const bldId = obj?._build ?? buildingId
	const mdlId = obj?.module?.id
	const ch = obj?.module?.channel - 1
	const r = {}
	if (type === 'on') {
		r[bldId] = { [mdlId]: { [ch]: 1 } }
	}
	if (type === 'off') {
		r[bldId] = { [mdlId]: { [ch]: 0 } }
	}
	setCmd(r)
}

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
	arr?.forEach((el) => ctrlB(el, idB, type))
}

module.exports = {
	stateEq,
	ctrlB,
	stateF,
	arrCtrl,
}
