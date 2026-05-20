const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { getAO } = require('@tool/in_out')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const { getMdl } = require('@tool/get/module')
const _MIN_SP = 20

/**
 * Блокировка дискретного выхода
 * @param {object} obj Глобальные данные PC
 * @param {object} output маска выходов
 * @param {object} o Исполнительный механизм - вентилятор, клапан, обогрев клапана
 * @param  {...boolean} locks сигналы блоlocksкировки
 */
function out(obj, output, o, ...locks) {
	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, o?.module?.id)
	// Не найден модуль или не передан исполнительный механизм
	if (!mdl || !o) return

	// Блокировка
	const lock = fn(locks)

	// Дискретный выход
	const ch = o?.module?.channel - 1
	mdl.value[ch] = +((mdl?.value?.[ch] ?? 0) && !lock)
}

/**
 * Блокировка аналогового выхода
 * @param {*} obj
 * @param {*} output
 * @param {*} f
 * @param {*} localB
 * @param {*} local
 * @param  {...boolean} args
 * @returns
 */
function ao(obj, output, f, localB, local, ...args) {
	// Блокировки
	const lock = fn(args)

	// Рама аналогового выхода
	const ao = getAO(obj?.data?.binding, f)
	if (!ao) return
	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, ao.moduleId)
	if (!mdl) return

	// Если есть блокировка -> аналоговый выход=20%
	if (lock) mdl.value[ao.channel - 1] = _MIN_SP

	// Местный переключатель => задание ВНО на 100%, DO выкл
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

// Блокировка клапана
function outV(type, output, vlv, ...args) {
	const idM = vlv?.module?.[type]?.id

	// Данные о модуле отправляемые на запись
	const { mdl } = getMdl(output, idM)
	if (!mdl || !vlv) return

	// Блокировка
	const lock = fn(args)

	// Изменяем значения выходов модуля перед отправкой на запись
	const ch = vlv?.module?.[type]?.channel - 1
	mdl.value[ch] = +((mdl?.value?.[ch] ?? 0) && !lock)
}

// Сумматор аварий: хотя бы 1 авария  =>return true авария активна
function fn(args) {
	return args.some((el) => el === true)
}

module.exports = { out, ao, outV, fn }
