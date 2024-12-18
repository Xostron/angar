const { ctrlB } = require('@tool/command/fan')
const { data: store, delExtra, wrExtra } = require('@store')
const { msg } = require('@tool/message')

// Модуль в сети
function connect(building, section, obj, s, se, m, alarm, acc, data, ban) {
	// Берем все выхода "Модуль в работе" и включаем
	const isErrM = !!Object.keys(store.alarm?.module?.[building._id] ?? {}).length

	m.connect.forEach((el) => {
		// Включение
		ctrlB(el, building._id, 'on')
		const sig = obj.value?.[el._id]
		if (!sig) {
			delExtra(building._id, el.owner.id, el.type)
			acc.flag = false
		}
		if (sig && !acc.flag) {
			wrExtra(building._id, el.owner.id, el.type, {
				date: new Date(),
				...fnMsg(building, el.owner.id, obj.data.section),
			})
			acc.flag = true
		}
		// TODO (всегда включен выход "модуль в работе" - раскомментировать по запросу)
		// У склада неисправный модуль отключаем везде выход connect
		// if (isErrM) {
		// 	ctrlB(el, building._id, 'off')
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
	return msg(building, s, 50)
}
