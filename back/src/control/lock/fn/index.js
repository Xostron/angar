const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { getAO } = require('@tool/in_out')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const _MIN_SP = 20

/**
 *
 * @param {object} obj Глобальные данные PC
 * @param {object} output маска выходов
 * @param {object} o Исполнительный механизм - вентилятор, клапан, обогрев клапана
 * @param  {...boolean} locks сигналы блоlocksкировки
 */
function out(obj, output, o, ...locks) {
	const mdl = o?.module?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.channel - 1
	const lock = fn(locks)
	// Дискретный выход
	output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !lock)
}

function ao(obj, output, f, localB, local, ...args) {
	const lock = fn(args)
	// Аналоговый выход
	// ВНО имеет аналоговое управление?
	const ao = getAO(obj?.data?.binding, f)
	if (ao && lock) {
		output[ao.moduleId] ??= {}
		output[ao.moduleId].value ??= {}
		output[ao.moduleId].value[ao.channel - 1] = _MIN_SP
	}
	// Местный переключатель => задание ВНО на 100%, DO выкл
	if (ao) {
		if (local || localB) {
			store.heap.fan[f._id] = true
			output[ao.moduleId].value[ao.channel - 1] = 100
		}
		// Перключатель в авто, однократно сбросить АО
		if (store.heap.fan?.[f._id] && !local && !localB) {
			store.heap.fan[f._id] = false
			output[ao.moduleId].value[ao.channel - 1] = _MIN_SP
		}
	}
}

function outV(type, output, o, ...args) {
	const mdl = o?.module?.[type]?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.[type]?.channel - 1
	const lock = fn(args)
	output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !lock)
}

// Сумматор аварий: хотя бы 1 авария  =>return true авария активна
function fn(args) {
	return args.some((el) => el === true)
}

module.exports = { out, ao, outV, fn }
