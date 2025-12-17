const { compareTime } = require('@tool/command/time')
const { msgV } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')

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
function long(bld, obj, v, s, acc, type = 'open') {
	// Аккумулятор клапана
	acc[v._id] ??= {}
	// Состояние и текущее положение клапана
	const { state, val } = obj?.value?.[v._id]

	// Время полного открытия
	const total = obj?.retain?.[bld._id]?.valve?.[v._id]
		? +obj?.retain?.[bld._id]?.valve?.[v._id]
		: undefined

	// Авария выключена
	if (type === 'open' ? !s?.overVlv?.onlo : !s?.overVlv?.onlc) return

	// Клапан сейчас не открывается и не закрывается || нет калибровки
	// Склад включен
	const start = obj.retain[bld._id].start
	if (!['icls', 'iopn'].includes(state) || !total || !start) {
		acc[v._id] = {}
		return
	}

	// Слежение за аварией
	fnDetect(v._id, val, state, acc, type)

	// 10% от общего калибровочного времени
	const wait = total * ((s?.overVlv?.long ?? 10) / 100)
	const time = compareTime(type === 'open' ? acc[v._id].waitO : acc[v._id].waitC, wait)
	console.log('ждем ', type, val, '%=', s.overVlv.long ?? 10, wait)

	// Время не прошло (ждем концевика)
	if (!time) return

	// Время прошло (Концевик не сработал)
	console.log('авария ', type)
	acc._alarm = true
	acc.flag = true
	if (type === 'open') delete acc?.[v._id]?.waitO
	else delete acc?.[v._id]?.waitC

	const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
	v.sectionId.forEach((idS) => {
		const section = obj.data.section.find((el) => el._id === idS)
		wrExtralrm(bld._id, idS, 'alrValve', msgV(bld, section, typeV, type === 'open' ? 30 : 31))
	})
}

function fnDetect(idV, val, state, acc, type) {
	if (type === 'open') {
		if (state === 'iopn' && val >= 100 && !acc[idV].waitO) acc[idV].waitO = new Date()
		console.log('fnDetect', type, acc[idV].waitO)
		return
	}
	if (state === 'icls' && val <= 0 && !acc[idV].waitC) acc[idV].waitC = new Date()
	console.log('fnDetect', type, acc[idV].waitC)
}

function fnClear(bld, acc, prepare) {
	// Очистка аккумулятора
	for (const key in acc) delete acc[key]
	// Очистка авар. сообщений
	prepare.vlv.forEach((v) => {
		v.sectionId.forEach((idS) => {
			delExtralrm(bld._id, idS, 'alrValve')
		})
	})
}

module.exports = { long, fnClear }
