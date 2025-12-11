const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const dict = {
	0: 'влажность улицы не подходит',
	1: 'температура продукта не подходит по точке росы',
	2: 'температура улицы не подходит',
	3: 'нет показаний датчиков (точка росы, темп. продукта, влажность улицы, темп. улицы)',
	4: 'нет показаний датчиков (точка росы, темп. продукта, влажность улицы, , темп. улицы, CO2)',
}

/**
 * Проверка: в ДАННЫЙ МОМЕНТ ВРЕМЕНИ разрешено включить удаление СО2
 *
 * @param {object} bld Склад
 * @param {object} prepare Подготовленные данные
 * @param {object} s Настройки
 * @returns {boolean} true Разрешено удаление СО2
 */
function checkNow(bld, prepare, s) {
	const {
		am,
		alrAuto,
		isCC,
		isCN,
		isN,
		start,
		ccFlagFinish,
		flagFinish,
		idsS,
		vlvClosed,
		fan,
		point,
		tprd,
		co2,
		hout,
		tout,
		isHout,
		validSe,
	} = prepare

	// Причины запрета
	let reason =
		s?.co2?.mode === 'sensor'
			? [isHout, point >= tprd - 1, tout <= s.co2.min, false, !validSe]
			: [isHout, point >= tprd - 1, tout <= s.co2.min, !validSe]
	//
	const error = reason
		.map((el, i) => (el ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')
	//
	if (reason.some((el) => el)) {
		// Запрет
		wrExtra(bld._id, null, 'co2', msgB(bld, 86, `${error}`), 'check2')
		return false
	}
	// Разрешение
	delExtra(bld._id, null, 'co2', 'check2')
	return true
}

module.exports = { checkNow }
