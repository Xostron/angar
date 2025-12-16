const { rs, isAlr, clearAA } = require('@tool/message/auto')
const tuneup = require('@tool/service/tune')
const { extra } = require('@control/extra/extra')
const extralrm = require('@control/extra/extralrm')
const def = require('@control/main/def/normal/def')

/**
 * СКЛАД: доп.функции - extra, доп. аварии - extralrm
 * @param {*} start
 * @param {*} building
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} am
 * @param {*} accAuto
 * @returns
 */
function build(start, building, obj, s, se, m, am, accAuto, resultFan, bdata) {
	let alrBld = false,
		alrAm = false
	// Доп. аварии и доп. функции (always - всегда выполняются)
	alrBld = alrBld || extralrm(building, null, obj, s, se, m, am, null, 'building', 'always')

	if (start) {
		// Склад включен
		// Доп. аварии и доп. функции (on - выполнение при включенном складе)
		alrBld = alrBld || extralrm(building, null, obj, s, se, m, am, null, 'building', 'on')
		extra(building, null, obj, s, se, m, null, resultFan, null, 'building', 'on')
		// Промежуточные расчеты
		def[am]?.middlewB(building, obj, s, se, am, accAuto, alrBld)
		// Аварии авторежима (Склад включен, )
		rs(building._id, am, def[am]?.alarm(s, se, building, accAuto, bdata))
		alrAm = isAlr(building._id, am)
	} else {
		// Склад выключен
		// Доп функции склада (off - выполнение при выключенном складе)
		extra(building, null, obj, s, se, m, null, resultFan, null, 'building', 'off')
		clearAA(building?._id, am)
	}

	extra(building, null, obj, s, se, m, /*null*/ alrBld, resultFan, null, 'building', 'always')
	// Калибровка клапанов
	tuneup(obj)
	return { alrBld, alrAm }
}

module.exports = build
