const { logger, loggerSens, loggerWatt } = require('@tool/logger')
const { message, checkTyp } = require('../fn')

/**
 * Логирование датчиков (total) с заданным периодом store.tStat
 * hin Влажность продукта max (обычный склад)
 * tprdL Температура продукта (обычный склад)
 * tin температура потолка (холодильный склад)
 * @param {object} total Расчетные данные с анализа (мин,макс датчиков)
 * @param {object[]} building Рама складов
 * @param {boolean} force принудительное логирование
 */
function sensTotalLog(total, building, force) {
	if (!total) return
	building.forEach((bld) => {
		const val = total[bld._id]
		;['hin', 'tprdL', 'tin'].forEach((el) => {
			const m = checkTyp(el, bld)
			if (!m && !force) return
			const type = ['hin', 'tin'].includes(el) ? el+'L' : el
			loggerSens['sensor']({
				message: {
					bldId: bld._id,
					type,
					state: val[el]?.state,
					value: val[el]?.[m],
				},
			})
		})
	})
}

/**
 * Логирование датчиков с заданным периодом store.tStat
 * @param {*} data
 * @param {*} arr
 * @param {*} value
 * @param {*} level
 * @param {boolean} force принудительное логирование
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
