const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { getAO } = require('@tool/in_out')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const { getMdl } = require('@tool/get/module')
const _MIN_SP = 20

/**
 *
 * @param {object} obj Глобальные данные PC
 * @param {object} output маска выходов
 * @param {object} o Исполнительный механизм - вентилятор, клапан, обогрев клапана
 * @param  {...boolean} locks сигналы блоlocksкировки
 */
function out(obj, output, o, ...locks) {
	const idM = o?.module?.id

	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, ao.moduleId)
	if (!mdl || !o) return
	const ch = o?.module?.channel - 1

	// Блокировка
	const lock = fn(locks)

	// Дискретный выход
	mdl.value[ch] = +((mdl?.value?.[ch] ?? 0) && !lock)
}

function ao(obj, output, f, localB, local, ...args) {
	const lock = fn(args)
	// Аналоговый выход
	// ВНО имеет аналоговое управление?
	const ao = getAO(obj?.data?.binding, f)

	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, ao.moduleId)
	if (!mdl) return

	if (ao && lock) {
		mdl.value[ao.channel - 1] = _MIN_SP
	}

	// Местный переключатель => задание ВНО на 100%, DO выкл
	if (ao) {
		if (local || localB) {
			store.heap.fan[f._id] = true
			mdl.value[ao.channel - 1] = 100
		}
		// Перключатель в авто, однократно сбросить АО
		if (store.heap.fan?.[f._id] && !local && !localB) {
			store.heap.fan[f._id] = false
			mdl.value[ao.channel - 1] = _MIN_SP
		}
	}
}

// Блокировка клапана
function outV(type, output, vlv, ...args) {
	const idM = vlv?.module?.[type]?.id

	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, idM)
	if (!mdl || !vlv) return
	const ch = vlv?.module?.[type]?.channel - 1

	// Блокировка
	const lock = fn(args)

	// Изменяем значения выходов модуля перед отправкой на запись
	mdl.value[ch] = +((mdl?.value?.[ch] ?? 0) && !lock)
}

// Сумматор аварий: хотя бы 1 авария  =>return true авария активна
function fn(args) {
	return args.some((el) => el === true)
}

module.exports = { out, ao, outV, fn }
