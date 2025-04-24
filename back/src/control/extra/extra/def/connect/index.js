const { ctrlDO } = require('@tool/command/module_output')
const { wrExtra } = require('@tool/message/extra')
const { msg, msgB } = require('@tool/message')

// Модуль в сети (сигнал склада/секции)
function connect(building, section, obj, s, se, m, alarm, acc, data, ban) {
	acc.flag ??= {}
	m.connect.forEach((el) => {
		// Включение выхода - Модуль в сети
		ctrlDO(el, building._id, 'on')
		const owner = el.owner.type === 'section' ? el.owner.id : null
		if (!acc.flag[el._id]) {
			const mes = fnMsg(building, owner, obj.data.section)
			wrExtra(building._id, owner, el.type, mes)
			acc.flag[el._id] = true
		}
		// TODO (всегда включен выход "модуль в работе" - раскомментировать по запросу)
		// У склада неисправный модуль отключаем везде выход connect
		// if (isErrM) {
		// 	ctrlDO(el, building._id, 'off')
		// 	delExtra(building._id, el.owner.id, el.type)
		// }
	})
}
module.exports = connect

/**
 * Включение выходов на модулях, которые принадлежат разным секциям
 * При отключении данного выхода срабатывает реле безопасности,
 * которое все отключает
 * Реле безопасности у каждой секции
 */
function fnMsg(building, sectionId, section) {
	const s = section.filter((el) => el._id == sectionId)?.[0] ?? null
	return s ? msg(building, s, 50) : msgB(building, 50)
}
