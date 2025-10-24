const { data: store, accDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const { readOne } = require('@tool/json')
const cbAcc = require('./fn')
const { isReset } = require('@tool/reset')

/**
 * Сохраняемые аварии для фиксации момента возникновения аварии и отображения
 * При первом запуске читаем файл acc.json аварии (Неисправность модулей и аварии авторежима)
 * @param {*} obj
 */
async function accAlarm(obj) {
	if (store._first) {
		obj.acc = await readOne('acc.json', accDir)
		store.alarm.module = obj.acc?.module
		store.alarm.auto = obj.acc?.auto
	}
	clear(obj.data, obj.acc)
	// Сохранение текущих аварий в файл
	await createAndModifySync(store.alarm, 'acc', accDir, cbAcc)
}

// Очистка неактуальных аварий (модулей) и при сбросе модулей
function clear(data, acc) {
	const { building, module } = data
	for (const bld of building) {
		// Сброс ошибок неисправного модуля
		if (isReset(bld._id)) {
			acc ??= {}
			acc.module ??= {}
			acc.module[bld._id] = {}
			store.alarm.module = {}
		}
		for (const mdlId in acc?.module?.[bld._id]) {
			if (module.find((el) => el._id === mdlId)) continue
			// Модуль не найден (удалить из аварий)
			delete acc?.module?.[bld._id]?.[mdlId]
		}
	}
}

module.exports = accAlarm
