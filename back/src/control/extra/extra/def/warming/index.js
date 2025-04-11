const {delExtra, wrExtra} = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')
const { ctrlB } = require('@tool/command/fan')
const { data: store } = require('@store')
const { cWarm } = require('@socket/emit')
const { msg } = require('@tool/message')

// Прогрев секции
function warming(building, section, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	// const cur = +new Date().getTime()
	const cmd = store?.warming?.[building._id]?.[section._id]
	const reset = m.reset.filter((el) => el.owner.id == section._id || el.owner.id == building._id)?.[0]
	if (!reset) return
	// Отрабатывает только в авторежиме
	// Нажали на кнопку, Вкл выход сброс аварии и напорные вентиляторы секции на 1 мин.
	if (cmd && !acc.end) {
		acc.end = new Date(new Date().getTime() + store.tWarming*1000)
		wrExtra(building._id, section._id, 'warming', msg(building, section, 59))
	}
	// Прошло время прогрева?
	const elapsed = compareTime(acc?.end, store.tWarming)

	// Включить Сброс аварии
	if (!!acc.end && !elapsed) {
		ctrlB(reset, building._id, 'on')
		resultFan.warming[section._id] = { fan: m.fanS, sectionId: section._id }
	}
	// Выключить Сброс аварии
	if ((!!acc.end && elapsed) || cmd === false) {
		ctrlB(reset, building._id, 'off')
		delete acc.end
		// очистить задание на прогрев
		store.warming ??= {}
		store.warming[building._id] ??= {}
		store.warming[building._id][section._id] = false
		// Удалить событие
		delExtra(building._id, section._id, 'warming')
		// событие на front: убрать окно прогрева клапанов
		cWarm({ buildingId: building._id, sectionId: section._id })
		// Удалить задание на вентиляторы
		delete resultFan?.warming?.[section._id]
		// очистить задание*
		// delete store?.warming?.[building._id]?.[section._id]
	}
}
module.exports = warming
