const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { data: store } = require('@store')
const ignore = require('./ignore')

/**
 * Выключение ВНО секции
 * @param {*} fans ВНО секции
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns {boolean} true - запрет управления ВНО, false - разрешить управление ВНО
 */
function turnOff(fanFC, fans, solHeat, bld, idS, aCmd, acc, bdata, where = 'normal') {
	const r = ignore[where](bld, acc, bdata, solHeat)
	if (r) return true
	if (aCmd.type == 'on') return false
	// Ручной режим -> запрет управления, но ВНО оставляем как есть
	// Продукт достиг задания aCmd.type=off и секция не в авто
	if (aCmd.type == 'off' && bdata.mode?.[idS]===false) {
		clear(idS)
		return true
	}
	// Выключение всех ВНО (однократно)
	if (acc.order !== -1) {
		fans.forEach((f, i) => {
			f?.ao?.id ? ctrlAO(f, bld._id, 0) : null
			ctrlDO(f, bld._id, 'off')
		})
		if (fanFC) {
			ctrlAO(fanFC, bld._id, 0)
			ctrlDO(fanFC, bld._id, 'off')
		}
		solHeat.forEach((el) => {
			ctrlDO(el, bld._id, 'off')
		})
	}
	clear(idS)
	return true
}



// Очистка аккумулятора
function clear(idS) {
	store.watchdog.softFan[idS].order = undefined
	store.watchdog.softFan[idS].date = undefined
	store.watchdog.softFan[idS].busy = false
	store.watchdog.softFan[idS].fc = undefined
	store.watchdog.softFan[idS].sol = undefined
	store.watchdog.softFan[idS].allStarted = undefined
}

module.exports = turnOff
