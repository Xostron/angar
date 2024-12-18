const { stateV } = require('@tool/command/valve')
const { data: store } = require('@store')
const def = require('./fn')

/**
 * Запуск калибровки клапанов
 * @param {*} obj данные по оборудованию
 * @returns
 */
function tuneup(obj) {
	// задание на калибровку
	const tune = store.tune
	if (!tune) return
	for (const key in tune) {
		// По окончанию калибровки убрать из задания
		if (tune[key]._stage === null) {
			delete tune[key]
			continue
		}
		tuneVlv(tune[key], obj.value)
	}
}

/**
 * Калибровка клапана
 * @param {*} vlv данные клапана
 * @param {*} value Показания модулей (входа, выхода)
 * @returns
 */
function tuneVlv(vlv, value) {
	const state = stateV(vlv?._id, value, vlv?._build, vlv?.sectionId[0])
	def[vlv._stage](vlv, state)
}

module.exports = tuneup
