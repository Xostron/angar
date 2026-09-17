const { fnSMode, fnVlv } = require('@tool/web/section_card/fn')
const { listSec, fnSensByType, fnFanBySec } = require('./fn')
const { fnSens } = require('@tool/web/bld_card/fn')

/**
 * Содержимое секции
 * @param {*} bld
 * @param {*} sec
 * @param {*} obj
 * @returns
 */
function innerNormal(bld, sec, obj) {
	return {
		// Список секций
		listSec: listSec(bld._id, obj.data?.section),
		// Режим секции: авто true, ручной false, выкл null|undefined
		mode: fnSMode(bld._id, sec._id, bld.type, obj?.retain),
		// Датчики
		sensor: [
			{ ...fnSens(bld._id, obj, 'hin', 'max', 'per', 'hin'), target: '--' },
			{ ...fnSens(sec._id, obj, 'p', 'max', 'Па', 'p'), target: '--' },
			{ ...fnSens(sec._id, obj, 'tcnl', 'min', 'grad', 'tcnl'), target: '--' },
		],
		tprd: { ...fnSens(bld._id, obj, 'tprd', 'minmax', 'grad', 'tprd'), target: '--' },
		// Датчики температуры продукта (Гистограмма)
		tprdChart: fnSensByType(sec._id, obj?.data?.sensor, obj, 'tprd'),
		// Клапаны
		valve: fnVlv(sec._id, obj),
		// ВНО
		fan: fnFanBySec(sec._id, obj?.data?.fan, obj),
	}
}

module.exports = innerNormal
