const { logger, loggerSens, loggerWatt } = require('@tool/logger')
const {message, checkTyp} = require('../fn')


/**
 * Логирование датчиков (по total)
 * hin Влажность продукта max (обычный склад)
 * tprdL Температура продукта (обычный склад)
 * tin температура потолка (холодильный склад)
 * @param {object} total Расчетные данные с анализа (мин,макс датчиков)
 * @param {object[]} building Рама складов
 */
function sensTotalLog(total, building) {
	if (!total) return
	building.forEach((bld) => {
		const val = total[bld._id]
		;['hin', 'tprdL', 'tin'].forEach((el) => {
			const m = checkTyp(el, bld)
			if (!m) return
			loggerSens['sensor']({
				message: {
					bldId: bld._id,
					type: el,
					state: val[el]?.state,
					value: val[el]?.[m],
				},
			})
		})
	})
}

/**
 * Логирование датчиков
 * @param {*} data
 * @param {*} arr
 * @param {*} value
 * @param {*} level
 * @returns
 */
function pLogConst(data, arr, value, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		switch (level) {
			case 'sensor':
				loggerSens[level]({ message: message(data, el, level, value) })
				break
			case 'watt':
				loggerWatt['watt']({ message: message(data, el, level, value) })
				break
			default:
				logger['watt']({ message: message(data, el, level, value) })
				break
		}
	})
}

module.exports = { sensTotalLog, pLogConst }
