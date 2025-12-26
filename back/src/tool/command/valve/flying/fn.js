const { data: store } = require('@store')

/**
 * Расчет задания для выпускного клапана ()
 * @param {*} idB ИД склада
 * @param {*} arrOut Массив выпускных клапанов
 * @param {*} obj Глобальные данные
 * @param {*} acc Аккумулятор для расчетов
 * @param {*} oIn Данные приточного клапана
 * @param {*} s Настройки
 */
function fnCalc(idB, arrOut, obj, acc, oIn, s) {
	for (const v of arrOut) {
		acc[v._id] ??= {}
		// 1:1 (клапан:секция)
		if (v.sectionId.length === 1) {
			singleTgt(v._id, acc, oIn)
			continue
		}
		// 1:n (клапан:много секций)
		multiTgt(v, acc, oIn, idS, arrOut, idB, obj)
	}
}

// Расчет задания: 1 выпускной клапан = 1 секция
function singleTgt(idV, acc, o) {
	acc[idV].target = o.posIn * o.k
	// target: o.posIn * o.k + acc?.surplus ?? 0,
}

// Расчет задания мультклапана: 1 выпускной клапан = несколько секций
function multiTgt(v, acc, o, idS, arrOut, idB, obj) {
	acc[v._id].section ??= {}
	acc[v._id].section[idS] = {
		target: o.posIn * o.kp * o.k,
	}
	acc[v._id].target = 0
	for (const key in acc[v._id].section) {
		acc[v._id].target += acc[v._id].section[key]?.target ?? 0
	}
	// Избыточное открытие (если суммарное задание на открытие больше 100, избыток переходит на соседние выпускные клапана)
	// Избыток / кол-во выпускных клапанов с одной секцией
	// Избыток учитывается только при всех работающих секции мультиклапана
	const surplus = acc[v._id].target - 100
	if (checkSect(v, obj, idB) && surplus > 0) {
		acc.surplus = surplus / quan(arrOut)
	}
}

// Положение клапана в %
function vlvPercent(vlvId, retainB) {
	if (!vlvId) return null
	return +((+retainB.valvePosition?.[vlvId] * 100) / +retainB.valve?.[vlvId]).toFixed(1)
}

// Количество выпускных клапанов, которые принадлежат только одной секции
function quan(arrOut) {
	return arrOut.filter((v) => v.idS.length == 1).length
}

// Проверка: в работе ли все секции мультиклапана (выпускной клапан с несколькими секциями)
function checkSect(vlv, obj, idB) {
	const listSection = vlv.idS
	return listSection.every((el) => obj.retain?.[idB]?.mode?.[el])
}

module.exports = { fnCalc, singleTgt, multiTgt, vlvPercent }
