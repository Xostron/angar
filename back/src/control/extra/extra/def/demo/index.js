const { compareTime, runTime, remTime } = require('@tool/command/time')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { data: store } = require('@store')
const { msgB } = require('@tool/message')
const { checklist } = require('@tool/demo/fn/init_data')

/**
 * Сообщения ПНР-демо режима
 * 1 Выключить склад
 * 2 Зайти в настройки "Окуривание"
 * 3 Настроить время и в поле "ВКЛЮЧИТЬ" выбрать вкл
 * 4 Дождаться конца окуривания: сообщения о завершении попадают на страницу "СИГНАЛЫ"
 * @param {*} building
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} alarm
 * @param {*} acc
 * @param {*} data
 * @param {*} ban
 * @param {*} resultFan
 * @param {*} clear
 * @returns
 */
function demo(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan, clear = false) {
	const idB = bld._id
	// Настройки демо
	const stg = s?.demo
	// Аккумулятор демо
	const demo = store.retain[bld?._id].demo
	const test = checklist?.[demo.order]
	if (demo.cur !== null) {
		const txt = `Тест ${demo.order + 1} из ${checklist.length}. Цикл ${demo.cur + 1} из ${demo.total}.\n${test?.name} ${remTime(demo.timeT, test.last)}.`
		wrExtra(idB, null, 'demo', msgB(bld, 44, txt))
	} else {
		delExtra(idB, null, 'demo')
	}
}

module.exports = demo
