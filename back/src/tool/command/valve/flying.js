const { ctrlV } = require('@tool/command/module_output')
const { data: store } = require('@store')

// Выпускной клапан секции
function flyingVlv(idB, idS, obj, acc, vlvS, s, forceOff) {
	const { data, value, retain } = obj
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
	console.log(8800, idS, vIn.type, arrOut.length)
	// ********** Параметры выпускного клапана **********
	// (их может быть несколько на секцию / или 1 на несколько секций)
	// Расчет задания
	for (const v of arrOut) {
		if (v.sectionId.length == 1) {
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
		const close = acc.vOut[v._id].target < pos - store.tDeadzone
		let type = open ? 'open' : 'close'
		if (!open && !close) type = 'stop'
		if (forceOff) type = 'close'
		ctrlV(v, idB, type)
	}
}

module.exports = flyingVlv

// Расчет задания: 1 выпускной клапан = 1 секция
function singleTgt(vlvId, acc, o) {
	acc.vOut ??= {}
	acc.vOut[vlvId] = {
		target: o.posIn * o.k,
		// target: o.posIn * o.k + acc?.vOut?.surplus ?? 0,
	}
}

// Расчет задания мультклапана: 1 выпускной клапан = несколько секций
function multiTgt(vlv, acc, o, idS, arrOut, idB, obj) {
	acc.vOut ??= {}
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
