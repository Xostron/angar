const { data: store } = require('@store')
const { elapsedTime } = require('@tool/command/time')
const mes = require('@dict/message')
const { msgB } = require('@tool/message')

function isAchieve(idB, name, code) {
	return store?.alarm?.achieve?.[idB]?.[name]?.[code]
}

// Achieve - это информационные сообщения режима: температура продукта достигла задания и т.д.
// Записать в achieve (доп. функции)
function wrAchieve(idB, name, o) {
	store.alarm.achieve ??= {}
	store.alarm.achieve[idB] ??= {}
	store.alarm.achieve[idB][name] ??= {}
	store.alarm.achieve[idB][name][o.code] = o
}

// Удалить из aciheve
function delAchieve(idB, name, code) {
	delete store?.alarm?.achieve?.[idB]?.[name]?.[code]
}

// Обновить запись сообщения
function updAchieve(idB, name, code, set) {
	if (!store.alarm.achieve?.[idB]?.[name]?.[code]) return
	for (const key in set) {
		store.alarm.achieve[idB][name][code][key] = set[key]
	}
}

/**
 * @description Очистка события "достиг задания" и добавление "Склад выключен"
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные склада
 * @param {object} accAuto Аккумулятор
 * @param {boolean} isAllSectOff true - Все секции выключены/руч
 * @param {boolean} start Склад включен
 */
function clearAchieve(bld, obj, accAuto, isAllSectOff, start) {
	if (!start || isAllSectOff) fnClear()
	add()
	// Очистка всех событий
	function fnClear() {
		if (!accAuto.clearAchieve) {
			delete store.alarm.achieve?.[bld._id]
			accAuto.clearAchieve = true
		}
		if (start || !isAllSectOff) delete accAuto?.clearAchieve
	}
	// Добавление и обновление события "Склад выключен"
	function add() {
		if (!start && !accAuto.datestop) accAuto.datestop = true

		if (start) {
			accAuto.datestop = null
			delAchieve(bld._id, 'building', mes[151].code)
		}
		if (accAuto.datestop) {
			const elapsed = elapsedTime(obj.retain?.[bld._id]?.datestop ?? null)
			const msg = elapsed ? mes[151].msg + ' ' + elapsed : null
			wrAchieve(bld._id, 'building', msgB(bld, 151, elapsed))
			// if (msg) updAchieve(bld._id, 'building', 'datestop', { msg })
		}
	}
}

module.exports = { wrAchieve, delAchieve, updAchieve, clearAchieve, isAchieve }
