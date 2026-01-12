const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')
const { arrCtrlDO } = require('@tool/command/module_output')
const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')

/**
 * Есть ли рабочие озонаторы со включенным автоматом
 * @param {*} bld
 * @param {*} obj
 * @param {*} m
 * @returns {object} {object[], boolean} arr - массив озонаторов, ready - общий сигнал готовности
 */
function getOzon(bld, obj, m) {
	const ready =
		m.ozon.some((el) => {
			// Рама beep "Автомат выключен"
			// const off = el.beep.find((e) => e.code === 'off')
			// Состояние данного сигнала (по-умолчанию ОК)
			const st = obj.value[el._id]?.beep?.off?.value ?? true
			return st
		}) && !!m.ozon.length
	let reason = m.ozon.length > 1 ? 'выключены автоматы' : 'выключен автомат'
	reason = !!m.ozon.length ? reason : null
	// Если озонаторы неисправны
	if (!ready && reason !== null)
		wrExtra(bld._id, null, 'ozon3', msgB(bld, 91, `Не готов. По причине: ${reason}`))
	else delExtra(bld._id, null, 'ozon3')
	return { arr: m.ozon, ready }
}

module.exports = getOzon
