const { data: store } = require('@store')
const { elapsedTime } = require('@tool/command/time')
const mes = require('@dict/message')
const { msgB } = require('@tool/message')

function isAchieve(idB, name, code) {
	return !!store?.alarm?.achieve?.[idB]?.[name]?.[code]
}
// Achieve - это информационные сообщения режима: температура продукта достигла задания и т.д.
// Записать в achieve (доп. функции)
function wrAchieve(idB, name, o) {
	store.alarm.achieve ??= {}
	store.alarm.achieve[idB] ??= {}
	store.alarm.achieve[idB][name] ??= {}

	!isAchieve(idB, name, o.code)
		? (store.alarm.achieve[idB][name][o.code] = o)
		: (store.alarm.achieve[idB][name][o.code].msg = o.msg)
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
	// Если выключен склад или все секции выключены -> очистка событий достижений
	fnClear()
	// Добавление/обновление сообщений "склад выкл"
	fnDatestop()
	// Добавление/обновление сообщений "нет секции в авто"
	fnSectOff()
	// Очистка всех событий
	function fnClear() {
		// Очистить все сообщения достижений, кроме сообщения склад выключен
		if (!start) {
			const datestop = { ...(store.alarm.achieve?.[bld._id]?.building?.datestop ?? {}) }
			store.alarm.achieve[bld._id] = {}
			store.alarm.achieve[bld._id].building = {}
			if (Object.keys(datestop).length)
				store.alarm.achieve[bld._id].building.datestop = datestop
			return
		}
		// Очистить все сообщения достижений, если склад включен,
		// но нет ни одной секции в авторежиме
		if (isAllSectOff) {
			const sectOff = { ...(store.alarm.achieve?.[bld._id]?.building?.sectOff ?? {}) }
			store.alarm.achieve[bld._id] = {}
			store.alarm.achieve[bld._id].building = {}
			if (Object.keys(sectOff).length) store.alarm.achieve[bld._id].building.sectOff = sectOff
		}
	}
	// Добавление и обновление события "Склад выключен"
	function fnDatestop() {
		if (start) {
			delAchieve(bld._id, 'building', 'datestop')
			return
		}
		const elapsed = elapsedTime(obj.retain?.[bld._id]?.datestop ?? null)
		wrAchieve(bld._id, 'building', msgB(bld, 151, elapsed))
	}
	// Добавление/обновление сообщений "нет секции в авто"
	function fnSectOff() {
		// Если склад выключен, то сообщение о секция не важно
		if (!start) return
		// Хоть одна секция в авто
		if (!isAllSectOff) {
			delAchieve(bld._id, 'building', mes[152].code)
			return
		}
		// Нет секции в авто
		wrAchieve(bld._id, 'building', msgB(bld, 152))
	}
}

module.exports = { wrAchieve, delAchieve, updAchieve, clearAchieve, isAchieve }
