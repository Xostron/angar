const { setCmd, setACmd, data: store } = require("@store")
const { ctrlV } = require("@tool/command/valve")

/**
 * АВТО: Формирование команды управления клапаном
 * @param {*} open условие на открытие
 * @param {*} close условие на закрытие
 * @param {*} sectionId
 * @param {*} s Настройки склада
 * @returns
 */
function fnValve(data, sectionId, s) {
	const { open, close, forceOpn, forceCls } = data
	if (!open && !close) return
	const o = {
		step: s.sys.step,
		delay: s.sys.wait,
		kIn: s.sys.cf.kIn,
		kOut: s.sys.cf.kOut,
		type: open ? "open" : "close",
	}
	setACmd("vlv", sectionId, o)
}

/**
 * Шаговое открытие/закрытие приточного клапана (step сек движется клапан, delay сек в стопе)
 * @param {*} vlvS клапаны
 * @param {*} buildingId ссылка на склад
 * @param {*} sectionId ссылка на секцию
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} step принудительно закрыть
 * @param {*} delay принудительно открыть
 */
function ctrlVSoft(vlvS, buildingId, sectionId, retain, forceCls, forceOpn) {
	// Принудительное закрытие клапанов: аварии
	if (forceCls) {
		store.aCmd ??= {}
		store.aCmd[sectionId] ??= {}
		store.aCmd[sectionId].vlv = null
		for (const vlv of vlvS) {
			store.watchdog??={}
			store.watchdog[vlv._id] = null
			ctrlV(vlv, buildingId, "close")
		}
		return
	}
	// Принудительное открытие клапанов: условие сушки
	if (forceOpn) {
		store.aCmd ??= {}
		store.aCmd[sectionId] ??= {}
		store.aCmd[sectionId].vlv = null
		for (const vlv of vlvS) {
			store.watchdog??={}
			store.watchdog[vlv._id] = null
			ctrlV(vlv, buildingId, "open")
		}
		return
	}
	// Команда на управление
	const aCmd = store.aCmd?.[sectionId]?.vlv

	if (!aCmd) return
	// Нет настроек калибровки
	if (!retain.valve || !retain.valvePosition) return

	// Приточный клапан
	const vlvIn = vlvS.find((vlv) => vlv.type === "in")

	if (!vlvIn) return

	// Расчет шага
	calcSoft(vlvIn, aCmd, retain)

	// Выполнение включение приточного клапана
	// Нет задания - пропускается
	if (!store.watchdog?.[vlvIn._id]?.endStep) return
	// Время шага не прошло - включаем клапан
	if (+new Date().getTime() < store.watchdog?.[vlvIn._id]?.endStep) {
		ctrlV(vlvIn, buildingId, store.watchdog?.[vlvIn._id]?.type)
	}
	// Время шага истекло - останавливаем клапан
	if (+new Date().getTime() > store.watchdog?.[vlvIn._id]?.endStep) {
		ctrlV(vlvIn, buildingId, "stop")
	}

	// Проверка времени простоя - очистка задания и расчетов
	if (+new Date().getTime() >= store.watchdog?.[vlvIn._id]?.endDelay) {
		store.watchdog[vlvIn._id] = null
		store.aCmd[sectionId].vlv = null
	}
}

// Расчеты для работы клапана в режиме шага (Xсек - откр/закр, Yсек - стоит)
// Расчеты сохраняются в store.watchdog.[valveId]
// Если клапан еще отрабатывает шаг, то ждем пока он закончится (store.watchdog?.[vlvIn._id] == null)
function calcSoft(vlvIn, aCmd, retain) {
	// Расчеты приточного клапана уже сделаны - выходим
	if (!!store?.watchdog?.[vlvIn._id]) return
	// Инициализация
	store.watchdog ??= {}
	store.watchdog[vlvIn._id] = {}
	// Направление клапана
	store.watchdog[vlvIn._id].type = aCmd.type
	// Момент времени включения клапана
	const begin = +new Date().getTime()
	// Момент времени отключения клапана (шаг)
	store.watchdog[vlvIn._id].endStep = begin + aCmd.step*1000 * aCmd.kIn
	// Момент времени завершения простоя клапана
	store.watchdog[vlvIn._id].endDelay =
		store.watchdog[vlvIn._id].endStep + aCmd.delay*1000
	// Шаг клапана, %
	store.watchdog[vlvIn._id].stepPer =
		(aCmd.step * 100) / +retain.valve[vlvIn._id]
}

// Выпускной клапан секции
function flyingVlv(buildingId, sectionId, obj, acc, vlvS, s, forceOff) {
	const { data, value, retain } = obj
	// Поиск приточного и выпускных клапанов
	const vIn = vlvS.find((el) => el.type === "in")
	// выпускные клапаны
	const arrOut = vlvS.filter((el) => el.type === "out")
	// ********** Параметры приточного клапана **********
	const oIn = {
		// Позиция, %
		posIn: vlvPercent(vIn?._id, retain?.[buildingId]),
		// Коэффициент выпускного клапана
		k: s.sys?.cf?.kOut ?? 1,
		// Коэффициент пропорциональности
		kp: vIn?.kp ?? 1,
	}

	// ********** Параметры выпускного клапана **********
	// (их может быть несколько на секцию / или 1 на несколько секций)
	// Расчет задания
	for (const v of arrOut) {
		if (v.sectionId.length == 1) {
			singleTgt(v._id, acc, oIn)
			continue
		}
		multiTgt(v, acc, oIn, sectionId, arrOut, buildingId, obj)
	}

	// Команда на открытие/закрытие
	for (const v of arrOut) {
		// Позиция выпускного клапана в %
		const pos = vlvPercent(v._id, retain?.[buildingId])
		// Гистерезис в %
		const hyst = 3
		// Направление клапана открыть/закрыть/стоп
		const open = acc.vOut[v._id].target > pos + hyst
		const close = acc.vOut[v._id].target < pos - hyst
		let type = open ? "open" : "close"
		if (!open && !close) type = "stop"
		if (forceOff) type = "close"
		ctrlV(v, buildingId, type)
	}
}

module.exports = { ctrlVSoft, flyingVlv, fnValve }

// Расчет задания: 1 выпускной клапан = 1 секция
function singleTgt(vlvId, acc, o) {
	acc.vOut ??= {}
	acc.vOut[vlvId] = {
		target: o.posIn * o.k,
		// target: o.posIn * o.k + acc?.vOut?.surplus ?? 0,
	}
}

// Расчет задания мультклапана: 1 выпускной клапан = несколько секций
function multiTgt(vlv, acc, o, sectionId, arrOut, buildingId, obj) {
	acc.vOut ??= {}
	acc.vOut[vlv._id] ??= {}
	acc.vOut[vlv._id].section ??= {}
	acc.vOut[vlv._id].section[sectionId] = {
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
	if (checkSect(vlv, obj, buildingId) && surplus > 0) {
		acc.vOut.surplus = surplus / quan(arrOut)
	}
}

// Положение клапана в %
function vlvPercent(vlvId, retainB) {
	if (!vlvId) return null
	return +(
		(+retainB.valvePosition?.[vlvId] * 100) /
		+retainB.valve?.[vlvId]
	).toFixed(1)
}

// Количество выпускных клапанов, которые принадлежат только одной секции
function quan(vOut) {
	return vOut.filter((v) => v.sectionId.length == 1).length
}

// Проверка: в работе ли все секции мультиклапана (выпускной клапан с несколькими секциями)
function checkSect(vlv, obj, buildingId) {
	const listSection = vlv.sectionId
	return listSection.every((el) => obj.retain?.[buildingId]?.mode?.[el])
}
