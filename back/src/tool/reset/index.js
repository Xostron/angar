const { data: store } = require('@store')
const { isExtralrm } = require('@tool/message/extralrm')
const { delDebMdl } = require('@tool/message/plc_module')

// Сброс аварий - флаг установить/обнулить
function reset(obj, type = true) {
	// обнулить
	if (!type) {
		return store.reset.clear()
	}
	// установить флаг сброса (в конце цикла он сбрасывается)
	store.reset.add(obj.buildingId)
	// Очистка аварий
	clearAlarm()
}

// Наличие: Сброс аварии на данном складе
function isReset(idB) {
	return store.reset.has(idB)
}

/**
 * Очистить аварийные сообщения по складу (extralrm) и аварии модулей
 * Информационные сообщения, аварии авторежима - не сбрасываются
 */
function clearAlarm() {
	console.log('@@@@@@@@@@@@@@@@@@@@@@Reset', store.reset)
	store.reset.forEach((idB) => {
		// Очистка сообщений неисправности модулей
		store.alarm.module[idB] = {}
		delDebMdl()
		// Очистка аварийных сообщений extralrm
		clearExtralrm()
		// store.alarm.extralrm[idB] = {}
		// store.acc[idB] = {}
	})
}

module.exports = { reset, isReset }

function clearExtralrm() {
	for (const idB in store.alarm.extralrm) {
		let extralrm = store.alarm.extralrm?.[idB]

		// idS, debounce, local ...
		for (const key in extralrm) {
			extralrm = extralrm?.[key]

			if (isExtralrm(idB, key, 'stableVno')) {
				console.log(111, idB, key, store.acc?.[idB]?.stableVno?.[key])
				delete store.acc?.[idB]?.stableVno?.[key]
			}
			console.log(222, idB, key, store.acc?.[idB])
		}
	}
}
