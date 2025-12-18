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
function long(bld, obj, v, s, acc, prepare, type = 'open') {
	// Аккумулятор клапана
	acc[v._id] ??= {}
	// Состояние и текущее положение клапана
	const { state, val } = obj?.value?.[v._id]
	// Время полного открытия
	const { total, wait } = fnTotal(bld, v, obj, s, type)

	// const start = obj.retain[bld._id].start

	// Если клапан имеет аварию, то пропускаем очистку аккумулятора
	// Если еще нет аварии, то для клапана, который сейчас не открывается
	// и не закрывается || нет времени полного открытия/шага - сброс аккумулятора
	if (!acc[v._id].alarm && (!['icls', 'iopn'].includes(state) || isNaN(total))) {
		acc[v._id] = {}
		return
	}

	// Точка отсчета долгой работы
	fnDetect(v._id, val, state, acc, type)

	const time = compareTime(type === 'open' ? acc[v._id].waitO : acc[v._id].waitC, wait)
	console.log('ждем ', type, val, '%=', s.overVlv.long ?? 10, wait)

	// Время не прошло (ждем концевика)
	if (!time) return console.log('Ждем', type, v._id, acc[v._id])

	// Время прошло (Концевик не сработал)
	console.log('авария ', type)
	if (type === 'open') acc[v._id].alarmOpn = true
	else acc[v._id].alarmCls = true

	// Настройка: Авария разрешена
	if (type === 'open' ? s?.overVlv?.onlo : s?.overVlv?.onlc) {
		acc._alarm = true
		acc.flag = true
	}
	// Сброс времени ожидания
	if (type === 'open') delete acc?.[v._id]?.waitO
	else delete acc?.[v._id]?.waitC

	const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
	v.sectionId.forEach((idS) => {
		const section = obj.data.section.find((el) => el._id === idS)
		// Если авария на клапане рабочей секции, то генерируем сообщение
		if (prepare.onIdsS.includes(idS))
			wrExtralrm(
				bld._id,
				idS,
				'alrValve',
				msgV(bld, section, typeV, type === 'open' ? 30 : 31)
			)
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

function fnTotal(bld, v, obj, s, type) {
	// Время полного открытия
	let total, wait
	if (type === 'open') {
		// Концевик открыто
		total = s.sys.step * 1000 * s.sys.cf.kIn
		// 10% от шага клапана
		wait = total * ((s?.overVlv?.long ?? 10) / 100)
		return { total, wait }
	}
	// Концевик закрыто
	total = obj?.retain?.[bld._id]?.valve?.[v._id]
		? +obj?.retain?.[bld._id]?.valve?.[v._id]
		: undefined
	// Калибровочное время + 10%
	wait = total + total * ((s?.overVlv?.long ?? 10) / 100)
	return { total, wait }
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
