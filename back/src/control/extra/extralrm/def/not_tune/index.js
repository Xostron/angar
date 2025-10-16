const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Склад не работает, требуется калибровка клапанов
function notTune(bld, _, obj, s, se, m, automode, acc, data) {
	// ?const valve = obj.data.valve()
	// const isValve
	// Сброс
	// if (!sig || isReset(building._id)) {
	// 	delExtralrm(building._id, null, 'alrClosed')
	// 	acc.alarm = false
	// }
	// // Установка
	// if (sig && !acc.alarm) {
	// 	wrExtralrm(building._id, null, 'alrClosed', msgB(building, 26))
	// 	acc.alarm = true
	// }
	// return acc.alarm ?? null
	console.log(1, '============not_tune=====================')
	const idS = obj.data.section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
	console.log(2, idS)
	const idVlv = obj.data.valve
		.filter((el) => el.sectionId.some((ell) => idS.includes(ell)))
		.map((el) => el._id)
	console.log(3, idVlv, null > 0, undefined > 0, NaN > 0, 'asd' > 0)
	const retainVlv = obj.retain?.[bld._id]?.valve
	let isOK = true
	for (const id in retainVlv) {
		if (retainVlv[id] > 0) continue
		isOK = false
	}
	if (!isOK && !acc.alarm) {
		wrExtralrm(bld._id, null, 'notTune', msgB(bld, 90))
		acc.alarm = true
		console.log(4)
	}
	if (isOK) {
		console.log(5)
		delExtralrm(bld._id, null, 'not_tune')
		acc.alarm = false
	}
}

module.exports = notTune

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
