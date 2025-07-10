const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { isAlr } = require('@tool/message/auto')
const { data: store } = require('@store')

/**
 * Выключение ВНО секции
 * @param {*} fans ВНО секции
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns {boolean} true - запрет управления ВНО, false - разрешить управление ВНО
 */
function turnOff(fanFC, fans, bld, idS, aCmd, acc, bdata, where = 'normal') {
	const r = ignore[where](bld, acc, bdata, where)
	if (r) return true
	if (aCmd.type == 'on') return false

	// Сброс аккумулятора
	clear(idS)
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bld._id, 0) : null
		ctrlDO(f, bld._id, 'off')
	})
	if (fanFC) {
		ctrlAO(fanFC, bld._id, 0)
		ctrlDO(fanFC, bld._id, 'off')
	}
	return true
}

const ignore = {
	normal,
	cold,
}
/**
 * normal - обычный склад и комби(режим обычный)
 * cold - комби (режим холодильник)
 *
 * Для комбинированного склада: игнорировать управление ВНО
 * при переходе из обычного в холодильный режим
 * @param {*} bld Склад
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns false - разрешить управление, true - запрет управления
 */
function normal(bld, acc, bdata, where) {
	if (bld.type == 'normal' || bdata.automode != 'cooling') return false
	const alrAuto = isAlr(bld._id, bdata.automode)
	return alrAuto
}
function cold(bld, acc, bdata, where) {
	// Проверка перехода из обычного в холодильный режим
	const alrAuto = isAlr(bld._id, bdata.automode)
	return !alrAuto
}

// Очистка аккумулятора
function clear(idS) {
	store.watchdog.softFan[idS].order = undefined
	store.watchdog.softFan[idS].date = undefined
	store.watchdog.softFan[idS].busy = false
	store.watchdog.softFan[idS].fc = undefined
}

module.exports = turnOff
