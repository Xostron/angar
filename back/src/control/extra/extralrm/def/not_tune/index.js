const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Tребуется калибровка клапанов
function notTune(bld, _, obj, s, se, m, automode, acc, data) {
	// Массив ИД секций
	const idS = obj.data.section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
	// Массив ИД клапанов
	const idVlv = obj.data.valve
		.filter((el) => el.sectionId.some((ell) => idS.includes(ell)))
		.map((el) => el._id)
	// Из retain файла: Объект ключ(ИД клапана): значение калибровки
	const retainVlv = obj.retain?.[bld._id]?.valve
	let isOK = true
	for (const id of idVlv) {
		// Клапан откалиброван
		if (retainVlv?.[id] > 0) continue
		// Клапан не откалиброван -> Ошибка
		isOK = false
		break
	}
	// Регистрация ошибки
	if (!isOK && !acc.alarm) {
		wrExtralrm(bld._id, null, 'notTune', msgB(bld, 90))
		acc.alarm = true
	}
	// Сброс ошибки: все клапаны откалиброваны
	if (isOK) {
		delExtralrm(bld._id, null, 'notTune')
		acc.alarm = false
	}
}

module.exports = notTune

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
