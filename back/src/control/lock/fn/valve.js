const { isExtralrm } = require('@tool/message/extralrm')
const { isLongVlv } = require('@tool/command/valve')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { data: store } = require('@store')
const { out, ao, outV, fn } = require('./index')

// Блокировки задвижки (клапана)
function vlv(obj) {
	const { value, data, retain, output } = obj
	for (const v of data.valve) {
		// Склада
		const idB = getIdB(v?.module?.on?.id, data.module)
		// ИД секций склада
		const idsS = getIdsS(obj.data.section, idB)
		// Концевики
		const opn = value?.[v._id]?.open
		const cls = value?.[v._id]?.close
		// Ручной режим работы секции
		const man = v.sectionId.every((idS) => retain?.[idB]?.mode?.[idS] === false)
		// Блокировки
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		const alrStop = isExtralrm(idB, null, 'alarm')
		const vlvLim = isExtralrm(idB, v.sectionId[0], 'vlvLim')
		const vlvLimB = isExtralrm(idB, null, 'vlvLim')
		const vlvCrash = isExtralrm(idB, 'vlvCrash', v._id)
		// Секция выключена (true)
		const offS =
			v.sectionId.map((el) => retain?.[idB]?.mode?.[el] ?? null).some((el) => el === null) &&
			cls
		// Долгое открытие
		// const alarmOpn = isLongVlv(idB, v)
		const open100 = fnOpen100(idB, v, retain)
		const close0 = fnClose0(idB, v, retain)
		// Низкая температура канала в авто/ручном режиме
		//  блокирует открытие и закрывает клапаны
		// в авторежиме через Х мин, в ручном режиме сразу же
		const low =
			isExtralrm(idB, null, 'alrClosed') ||
			idsS.some((idS) => isExtralrm(idB, idS, 'alrClosed'))

		// console.log(
		// 	3333,
		// 	'lock',
		// 	v.type,
		// 	local,
		// 	vlvLim,
		// 	vlvLimB,
		// 	vlvCrash,
		// 	offS,
		// 	alrStop,
		// 	open100,
		// 	close0 && !man,
		// 	low,
		// )
		// блокировка открытия
		outV(
			'on',
			output,
			v,
			opn,
			local,
			vlvLim,
			vlvLimB,
			vlvCrash,
			offS,
			alrStop,
			open100,
			close0 && !man,
			low,
		)
		// При низкой температуре канала закрываем клапан в авто/руч
		if (low && !cls) forceCls(output, v)
		// блокировка закрытия
		outV('off', output, v, cls, local, vlvLim, vlvLimB, vlvCrash, close0, offS, alrStop)
	}
}

/**
 * Блокировка открытия клапана по достижениию 100%
 * @param {*} idB
 * @param {*} v
 * @param {*} retain
 * @returns true - блокировать
 */
function fnOpen100(idB, v, retain) {
	const cur = +retain?.[idB]?.valvePosition?.[v._id]
	const total = +retain?.[idB]?.valve?.[v._id]
	// Если нет значений - не блокировать
	if (isNaN(cur) || isNaN(total)) return false
	// Если позиция больше калибровочного - блокировать
	if (cur >= total) return true
	return false
}

// Блокировка если клапан на позиции 0 и авария долгого закрытия и секция не в ручном режиме
function fnClose0(idB, v, retain) {
	const alarmCls = isLongVlv(idB, v, 'close')
	const cur = +retain?.[idB]?.valvePosition?.[v._id]

	// Если нет значений
	if (isNaN(cur)) return false
	// Если есть авария долгого открытия и позиция клапана=0 - блокировать
	return alarmCls && cur === 0
}

function forceCls(output, o) {
	const mdl = o?.module?.off?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.off?.channel - 1
	output[mdl].value[ch] = 1
}

module.exports = vlv
