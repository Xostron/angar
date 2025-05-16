const { data: store } = require('@store')
const { wrAchieve, delAchieve, updAchieve } = require('@tool/message/achieve')
const { elapsedTime } = require('@tool/command/time')
const mes = require('@dict/message')
const { msgB } = require('@tool/message')

/**
 * @description Очистка события "достиг задания"
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные склада
 * @param {object} accAuto Аккумулятор
 * @param {boolean} isAllSectOff true - Все секции выключены/руч
 * @param {boolean} start Склад включен
 */
function clearAchieve(bld, obj, accAuto, isAllSectOff, start) {
	console.log('clearAchieveclearAchieveclearAchieveclearAchieve', isAllSectOff)

	if (!start || isAllSectOff) fnClear()
	add()

	// Очистка событий
	function fnClear() {
		if (!accAuto.clearAchieve) {
			delete store.alarm.achieve?.[bld._id]
			accAuto.clearAchieve = true
		}
		if (start || !isAllSectOff) delete accAuto?.clearAchieve
	}
	// Добавление события "Склад выключен"
	function add() {
		if (!start && !accAuto.datestop) {
			accAuto.datestop = true
			wrAchieve(bld._id, 'building', msgB(bld, 151))
		}
		if (start) {
			accAuto.datestop = null
			delAchieve(bld._id, 'building', mes[151].code)
		}
		if (accAuto.datestop) {
			const elapsed = elapsedTime(obj.retain?.[bld._id]?.datestop ?? null)
			const msg = elapsed ? mes[151].msg + ' ' + elapsed : null
			if (msg) updAchieve(bld._id, 'building', 'datestop', { msg })
		}
	}
}

/**
 * @description Очистка аккумулятора, когда выключен склад или все секции не в авто
 * @param {object} accAuto Аккумулятор
 * @param {boolean} isAllSectOff true - Все секции выключены/руч
 * @param {boolean} start Склад включен
 * @returns
 */
function clearAcc(accAuto, isAllSectOff, start) {
	if (isAllSectOff) return fnClear()
	if (!start) return fnClear()
	function fnClear() {
		if (!Object.keys(accAuto).length) return
		for (const key in accAuto) {
			if (['cold', 'datestop', 'clearAchieve'].includes(key)) continue
			delete accAuto[key]
		}
	}
}

function clear(bld, obj, accAuto, isAllSectOff, start) {
	clearAcc(accAuto, isAllSectOff, start)
	clearAchieve(bld, obj, accAuto, isAllSectOff, start)
}
module.exports = clear
