const { data: store, readAcc } = require('@store')
const def = require('@control/main/def/normal/def')
const { fnValve } = require('@tool/command/valve/auto')
const fnAlarm = require('./fn/alarm')

/**
 * Логика секции в авто
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} seB
 * @param {*} m
 * @param {*} am
 * @param {*} acc
 * @param {*} resultFan
 * @param {*} alrBld
 * @param {*} alrAm
 * @param {*} alrAlw
 * @returns
 */
function auto(bld, sect, obj, s, se, seB, m, am, acc, resultFan, alrBld, alrAm, alrAlw) {
	const { isCO2work, alr, notDur } = fnAlarm(
		bld,
		sect,
		obj,
		s,
		se,
		seB,
		m,
		am,
		acc,
		resultFan,
		alrBld,
		alrAm,
		alrAlw,
	)

	// Промежуточные расчеты
	if (def[am]?.middlew) def[am]?.middlew(bld, sect, obj, s, se, seB, alr, acc)

	// Клапаны
	const v = def[am].valve(bld, sect._id, obj, m, s, se, am, acc, isCO2work, alr)
	fnValve(v, sect._id, s)

	// ВНО
	const f = def[am].fan(s, se, alr, sect._id, acc)
	resultFan.start.push(f.start)
	resultFan.notDur.push(notDur)

	// Аккумулятор
	const t = bld?.type == 'normal' ? (am ?? bld?.type) : bld?.type
	store.acc[bld._id][t] = { ...acc }

	return { alr, v }
}

module.exports = auto
