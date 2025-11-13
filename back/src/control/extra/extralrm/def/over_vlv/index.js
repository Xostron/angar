const { curStateV } = require('@tool/command/valve')
const { stateEq } = require('@tool/command/fan/fn')
const { set, reset, fnCheck } = require('./fn')

/**
 * Превышено время работы с закрытыми клапанами (работает только в авторежиме)
 * @param {*} bld Рама склада
 * @param {*} sect Рама секции
 * @param {*} obj Глобальный объект цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns
 */
function overVlv(bld, sect, obj, s, se, m, automode, acc, data) {
	// Состояние приточного клапана
	console.log(33, 'overVlv', acc)
	const vlvIn = m.vlvS.find((vlv) => vlv.type === 'in')
	if (!fnCheck(bld, sect, obj, m, vlvIn, s, automode, acc)) return false

	const state = curStateV(vlvIn._id, obj.value)
	// Хотя бы один вентилятор запущен
	const run = m.fanS.some((f) => stateEq(f._id, obj.value))
	// Условие аварии: приточ. клапан закрыт И запущен ВНО
	const term = state === 'cls' && run

	reset(bld, sect, s, acc, term)
	set(bld, sect, obj, m, s, acc, term)

	return acc._alarm ?? false
}

module.exports = overVlv
