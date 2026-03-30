const check = require('./check')
const action = require('./action')
const { coupleClr } = require('@tool/command/mech/fn')

/**
 * если включили все соленоиды и вентиляторы испарителей, давление выше максимума:
 * - 2 испарителя: то выключаем один испаритель (выкл соленоид и
 * вентилятор и включаем заслонку).
 * - 2 испарителя с общим вентилятором: то снижаем скорость до 50%,
 * и у одного испарителя выкл соленоид и вкл заслонку
 * @param {*} bld
 * @param {*} sect
 * @param {*} clr
 * @param {*} bdata
 * @param {*} alr
 * @param {*} stateCooler
 * @param {*} fnChange
 * @param {*} obj
 */
function pressure(idB, idS, mS, s, seS, fnChange, accAuto, alrAuto, sectM, obj) {
	const couple = coupleClr(idB, mS, true)
	const reason = check(idS, mS, s, seS, accAuto, sectM, obj)
	action(idB, idS, mS, couple, s, seS, fnChange, accAuto, alrAuto, sectM, obj, reason)
}

module.exports = pressure

//
