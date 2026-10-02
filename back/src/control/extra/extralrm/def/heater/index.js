const { msgB } = require('@tool/message')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийные сообщения обогревателя
function fnHeater(bld, section, obj, s, se, m, automode, acc, data) {
	m?.heater?.forEach((el) => {
		const beep = obj.value?.[el._id]?.beep
		// Автомат выключен
		if (!beep?.off?.value) delExtralrm(bld._id, 'heater', 'off' + el._id)
		else
			wrExtralrm(
				bld._id,
				'heater',
				'off' + el._id,
				msgB(bld, 162, `Обогреватель ${el.order}. Автомат выключен`),
				el.module.id,
			)
		// Перегрев
		if (!beep?.offt?.value) delExtralrm(bld._id, 'heater', 'offt' + el._id)
		else
			wrExtralrm(
				bld._id,
				'heater',
				'offt' + el._id,
				msgB(bld, 163, `Обогреватель ${el.order}. Перегрев`),
				el.module.id,
			)
	})

	return false
}

module.exports = fnHeater
