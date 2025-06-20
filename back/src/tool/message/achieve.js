const { data:store } = require('@store')
const { elapsedTime } = require('@tool/command/time')
const mes = require('@dict/message')
const { msgB } = require('@tool/message')

// Achieve - это информационные сообщения режима: температура продукта достигла задания и т.д.
// Записать в achieve (доп. функции)
function wrAchieve(buildingId, name, o) {
	store.alarm.achieve ??= {}
	store.alarm.achieve[buildingId] ??= {}
	store.alarm.achieve[buildingId][name] ??= {}
	store.alarm.achieve[buildingId][name][o.code] = o
}

// Удалить из aciheve
function delAchieve(buildingId, name, code) {
	delete store?.alarm?.achieve?.[buildingId]?.[name]?.[code]
}

// Обновить запись сообщения
function updAchieve(buildingId, name, code, set) {
	if (!store.alarm.achieve?.[buildingId]?.[name]?.[code]) return
	for (const key in set) {
		store.alarm.achieve[buildingId][name][code][key] = set[key]
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
console.log(999001, bld.name)
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
			wrAchieve(bld._id, 'building', msgB(bld, 151))
			if (msg) updAchieve(bld._id, 'building', 'datestop', { msg })
		}
	}
}

module.exports = { wrAchieve, delAchieve, updAchieve, clearAchieve }
