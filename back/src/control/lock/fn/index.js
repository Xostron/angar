const { setACmd, data: store, isExtralrm } = require('@store')
const { getIdB } = require('@tool/get/building')
// Блокировки задвижки (клапана)
function vlv(obj) {
	const { value, data, retain, output } = obj
	for (const v of data.valve) {
		const mdlOnId = v?.module?.on?.id

		const opn = value?.[v._id]?.open
		const cls = value?.[v._id]?.close

		const idB = getIdB(mdlOnId, data.module)
		// Защита от клапанов без привязки модулей в админпанели
		// if (!mdlOnId || !mdlOffId || isNaN(chOn) || isNaN(chOff)) continue

		const local = isExtralrm(idB, v.sectionId[0], 'local')
		const localB = isExtralrm(idB, null, 'local')
		const alrStop = isExtralrm(idB, null, 'alarm')
		const vlvLim = isExtralrm(idB, v.sectionId[0], 'vlvLim')
		const vlvLimB = isExtralrm(idB, null, 'vlvLim')
		const vlvCrash = isExtralrm(idB, v.sectionId[0], 'vlvCrash' + v._id)
		const longOC = isExtralrm(idB, v.sectionId[0], 'alrValve')

		// Секция выключена (true)
		const offS = v.sectionId.map((el) => retain?.[idB]?.mode?.[el] ?? null).some((el) => el === null) && cls
		// console.log(3333, 'lock', v.type, local, vlvLim, vlvLimB, vlvCrash, longOC, offS)
		// блокировка открытия
		outV('on', output, v, opn, localB, local, vlvLim, vlvLimB, vlvCrash, longOC, offS, alrStop)
		// // блокировка закрытия
		outV('off', output, v, cls, localB, local, vlvLim, vlvLimB, vlvCrash, longOC, offS, alrStop)
	}
}

// Блокировки напорных вентиляторов (обычный склад)
function fan(obj) {
	const { value, data, retain, output } = obj
	for (const f of data.fan) {
		if (f.type !== 'fan') continue
		if (f.owner.type === 'cooler') continue
		const mdl = f?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		// Состояние вентилятора: авария / выведен из работы
		const isAlrOff = value?.[f._id]?.state === 'alarm' || value?.[f._id]?.state === 'off' ? true : false
		// местный режим (aCmd.end - флаг о плавном останове вентиляторов)
		const local = isExtralrm(idB, f.owner.id, 'local') && !store.aCmd?.[f.owner.id]?.fan?.end
		const localB = isExtralrm(idB, null, 'local') && !store.aCmd?.[f.owner.id]?.fan?.end
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') && !store.aCmd?.[f.owner.id]?.fan?.end
		// Секция выключена (null)
		let offS = (retain?.[idB]?.mode?.[f.owner.id] ?? null) === null
		// offS = offS && !store.aCmd?.[f.owner.id]?.fan?.end
		// output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !isAlrOff && !local && offS !== null)
		out(output, f, isAlrOff, localB, local, offS, alrStop)
	}
}
// Блокировки напорных вентиляторов (обычный склад и холодильник)
function fanAccel(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.fan) {
		if (el.type !== 'accel') continue
		if (el.owner.type === 'cooler') continue
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)

		// местный режим (aCmd.end - флаг о плавном останове вентиляторов)
		const local = isExtralrm(idB, el.owner.id, 'local') //&& !store.aCmd?.[el.owner.id]?.fan?.end
		const localB = isExtralrm(idB, null, 'local')
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') //&& !store.aCmd?.[el.owner.id]?.fan?.end
		// Таймер запрета
		const ban = store.alarm.timer?.[idB]?.accel

		out(output, el, localB, local, !!ban, alrStop)
	}
}

// Блокировки всех обогревов и оттаек
function heating(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.heating) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		// местный режим
		const local = isExtralrm(idB, el.owner.id, 'local')
		const localB = isExtralrm(idB, null, 'local')
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		out(output, el, localB, local, alrStop)
	}
}

// Блокировка устройств (СО2, увлажнитель, озонатор)
function device(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.device) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		// местный режим
		const localB = isExtralrm(idB, null, 'local')
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		out(output, el, localB, alrStop)
	}
}

module.exports = { vlv, fan, fanAccel, heating, device }

/**
 *
 * @param {*} output объект выхода
 * @param {*} o устройство включения - вентилятор, клапан, обогрев клапана
 * @param  {...boolean} args сигналы блкировки
 */
function out(output, o, ...args) {
	const mdl = o?.module?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.channel - 1
	const lock = fn(args)
	output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !lock)
}

function outV(type, output, o, ...args) {
	const mdl = o?.module?.[type]?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.[type]?.channel - 1
	const lock = fn(args)
	output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !lock)
}

function fn(args) {
	return args.some((el) => el === true)
}
