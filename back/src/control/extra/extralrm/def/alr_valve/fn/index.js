const { compareTime } = require('@tool/command/time')
const { msgV } = require('@tool/message')
const { wrExtralrm } = require('@tool/message/extralrm')

/**
 * Когда клапан достиг 100% и дальше открывает до концевика,
 * ожидаем 20% от общего калибровочного времени, если за это время
 * концевик открыто так и не наступит, то авария (Останов всего склада)
 * @param {*} bld
 * @param {*} sect
 * @param {*} val
 * @param {*} v
 * @param {*} hyst
 * @param {*} hystPos
 * @param {*} typeV
 * @param {*} curTime
 * @param {*} acc
 */
function longOpn(bld, obj, v, s, acc) {
	// Состояние и текущее положение клапана
	const { state, val } = obj?.value?.[v._id]

	// Авария выключена
	if (!s?.overVlv?.onlo) return

	if (!['icls', 'iopn'].includes(state) || !obj?.retain?.[bld._id]?.valve?.[v._id])
		return (acc[v._id] = {})

	if (val >= 100 && !acc[v._id].wait) acc[v._id].wait = new Date()

	// 20% от общего калибровочного времени
	const wait = +obj?.retain?.[bld._id]?.valve?.[v._id] * 0.1
	const time = compareTime(acc[v._id].wait, wait)
	console.log('ждем открытие', wait)
	// Время не прошло (ждем концевика)
	if (!time) return
	console.log('авария открытие')
	// Время прошло (Концевик не сработал)
	// acc[v._id].finish = true
	acc._alarm = true
	acc.flag = true
	delete acc[v._id].wait
	const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
	v.sectionId.forEach((idS) => {
		const section = obj.data.section.find((el) => el._id === idS)
		wrExtralrm(bld._id, idS, 'alrValve', msgV(bld, section, typeV, 30))
	})
}

function longCls(bld, obj, v, s, acc) {
	// Состояние и текущее положение клапана
	const { state, val } = obj?.value?.[v._id]

	// Авария выключена
	if (!s?.overVlv?.onlc) return

	if (!['icls', 'iopn'].includes(state) || !obj?.retain?.[bld._id]?.valve?.[v._id])
		return (acc[v._id] = {})

	if (val <= 0 && !acc[v._id].wait) acc[v._id].wait = new Date()

	// 20% от общего калибровочного времени
	const wait = +obj?.retain?.[bld._id]?.valve?.[v._id] * 0.2
	const time = compareTime(acc[v._id].wait, wait)
	console.log('ждем закрытия', wait)
	// Время не прошло (ждем концевика)
	if (!time) return
	console.log('авария закрытия')
	// Время прошло (Концевик не сработал)
	// acc[v._id].finish = true
	acc._alarm = true
	acc.flag = true
	delete acc[v._id].wait
	const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
	v.sectionId.forEach((idS) => {
		const section = obj.data.section.find((el) => el._id === idS)
		wrExtralrm(bld._id, idS, 'alrValve', msgV(bld, section, typeV, 31))
	})
}

function fnClear(acc, prepare) {
	// Очистка аккумулятора
	for (const key in acc) delete acc[key]
	// Очистка авар. сообщений
	prepare.vlv.forEach((v) => {
		v.sectionId.forEach((idS) => {
			delExtralrm(bld._id, idS, 'alrValve')
		})
	})
}

module.exports = { longOpn, longCls, fnClear }
