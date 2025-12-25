const { ctrlV } = require('@tool/command/module_output')
const { data: store } = require('@store')
const { compareTime } = require('../time')

// Выпускной клапан секции
function flyingVlv(idB, idS, obj, acc, vlvS, s, forceOff) {
	const { data, value, retain } = obj
	acc.vOut ??= {}
	// Поиск приточного и выпускных клапанов
	const vIn = vlvS.find((el) => el.type === 'in')
	// выпускные клапаны
	const arrOut = vlvS.filter((el) => el.type === 'out')
	if (!vIn || !arrOut?.length) return
	// ********** Параметры приточного клапана **********
	const oIn = {
		// Позиция, %
		posIn: vlvPercent(vIn?._id, retain?.[idB]),
		// Коэффициент выпускного клапана
		k: s.sys?.cf?.kOut?.k ?? 1,
		// Коэффициент пропорциональности
		kp: vIn?.kp ?? 1,
	}
	console.log(4400, 'Приточный клапан', idS, oIn)
	// ********** Параметры выпускного клапана **********
	// (их может быть несколько на секцию / или 1 на несколько секций)
	// Расчет задания
	for (const v of arrOut) {
		if (v.sectionId.length === 1) {
			singleTgt(v._id, acc, oIn)
			continue
		}
		multiTgt(v, acc, oIn, idS, arrOut, idB, obj)
	}
	// Команда на открытие/закрытие
	for (const v of arrOut) {
		// Позиция выпускного клапана в %
		const pos = vlvPercent(v._id, retain?.[idB])
		// Направление клапана открыть/закрыть/стоп
		const open = acc.vOut[v._id].target > pos + store.tDeadzone
		const t = pos - store.tDeadzone < 0 ? 0 : pos - store.tDeadzone
		const close = acc.vOut[v._id].target < t
		let type = open ? 'open' : 'close'
		if (!open && !close) type = 'stop'
		if (forceOff) type = 'close'

		fnCtrl(idB, v, type, obj, acc, s)

		// console.log(
		// 	4400,
		// 	'Выпускной клапан',
		// 	'open = ',
		// 	open,
		// 	'=',
		// 	acc.vOut[v._id].target,
		// 	'>',
		// 	pos + store.tDeadzone + 1
		// )
		// console.log(
		// 	4400,
		// 	'Выпускной клапан',
		// 	'close = ',
		// 	close,
		// 	'=',
		// 	acc.vOut[v._id].target,
		// 	'<',
		// 	pos - store.tDeadzone - 1
		// )
		console.log(4400, 'RESULT TYPE = ', type, acc.vOut)
	}
}

module.exports = flyingVlv

// Расчет задания: 1 выпускной клапан = 1 секция
function singleTgt(vlvId, acc, o) {
	acc.vOut[vlvId] = {
		target: o.posIn * o.k,
		// target: o.posIn * o.k + acc?.vOut?.surplus ?? 0,
	}
}

// Расчет задания мультклапана: 1 выпускной клапан = несколько секций
function multiTgt(vlv, acc, o, idS, arrOut, idB, obj) {
	acc.vOut[vlv._id] ??= {}
	acc.vOut[vlv._id].section ??= {}
	acc.vOut[vlv._id].section[idS] = {
		target: o.posIn * o.kp * o.k,
	}
	acc.vOut[vlv._id].target = 0
	for (const key in acc.vOut[vlv._id].section) {
		acc.vOut[vlv._id].target += acc.vOut[vlv._id].section[key]?.target ?? 0
	}
	// Избыточное открытие (если суммарное задание на открытие больше 100, избыток переходит на соседние выпускные клапана)
	// Избыток / кол-во выпускных клапанов с одной секцией
	// Избыток учитывается только при всех работающих секции мультиклапана
	const surplus = acc.vOut[vlv._id].target - 100
	if (checkSect(vlv, obj, idB) && surplus > 0) {
		acc.vOut.surplus = surplus / quan(arrOut)
	}
}

// Положение клапана в %
function vlvPercent(vlvId, retainB) {
	if (!vlvId) return null
	return +((+retainB.valvePosition?.[vlvId] * 100) / +retainB.valve?.[vlvId]).toFixed(1)
}

// Количество выпускных клапанов, которые принадлежат только одной секции
function quan(vOut) {
	return vOut.filter((v) => v.idS.length == 1).length
}

// Проверка: в работе ли все секции мультиклапана (выпускной клапан с несколькими секциями)
function checkSect(vlv, obj, idB) {
	const listSection = vlv.idS
	return listSection.every((el) => obj.retain?.[idB]?.mode?.[el])
}

/**
 * 1. Если температура улицы < Настройки "Температура улицы для открытия
 * выпускного клапана по шагам" - управление по шагам на открытие
 * 2. Обычное открытие клапана
 * Закрытие склада  - всегда обычное
 */
/**
 *
 * @param {*} idB ИД склада
 * @param {*} v Рама клапана
 * @param {*} type Тип команды: open, close, stop
 * @param {*} obj Глобальный объект склада
 * @param {*} s Настройки
 * @param {*} acc Аккумулятор
 */
function fnCtrl(idB, v, type, obj, acc, s) {
	console.log(4411, 'fnCtrl')
	// Стоп, закрыть
	if (['stop', 'close'].includes(type)) {
		ctrlV(v, idB, type)
		return
	}
	// Открыть
	if (fnCheck(obj, acc, s)) {
		fnStep(idB, v, type, obj, acc, s)
	} else {
		// Обычное открытие - очистка аккумулятора шагового управления
		delete acc?.vOut?.work
		delete acc?.vOut?.wait
		ctrlV(v, idB, 'open')
	}
}

/**
 * Проверка условий для шагового открытия выпускного клапана
 * @param {*} obj
 * @param {*} acc
 * @param {*} s
 * @returns true - управление по шагам, false - обычное управление
 */
function fnCheck(obj, acc, s) {
	const tout = obj?.value?.total?.tout?.min
	console.log(4411, 'fnCheck', tout, s.sys.outStep)
	if (tout <= s.sys.outStep) acc.vOut.byStep = new Date()
	if (acc?.vOut?.byStep && tout > s.sys.outStep + s.cooling.hysteresisIn) delete acc?.vOut?.byStep
	console.log(
		4422,
		!!acc?.vOut?.byStep ? 'Управление по шагам' : 'обычное открытие',
		'выпускным клапаном'
	)
	return !!acc?.vOut?.byStep
}

// Шаговое управление выпускным клапаном
function fnStep(idB, v, type, obj, acc, s) {
	if (!s) return
	// Время шага
	acc.vOut.work ??= new Date()
	let time = compareTime(acc.work, s.sys.step)

	// 1. Время шага не прошло - открываем
	if (!time) {
		ctrlV(v, idB, 'open')
		return
	}
	// 2. Время шага прошло - ждем (останавливаем клапан)
	ctrlV(v, idB, 'stop')
	acc.vOut.wait ??= new Date()
	time = compareTime(acc.wait, s.sys.wait)
	// 3. Время ожидания прошло - очищаем аккумулятор - цикл запускается далее
	if (time) {
		delete acc?.vOut?.work
		delete acc?.vOut?.wait
	}
}
