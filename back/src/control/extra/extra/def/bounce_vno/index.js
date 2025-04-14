const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')
const { stateV } = require('@tool/command/valve')
const { stateEq } = require('@tool/command/fan')
const { isReset } = require('@tool/reset')
const { data: store } = require('@store')
const { msg } = require('@tool/message')

/**
 * По секциям
 * Дребезг вентиляторов ВНО
 * @param {*} building Рама склада
 * @param {*} section Рама секции
 * @param {*} obj Глобальный объект цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns
 */
function bounceVno(building, section, obj, s, se, m, automode, acc, data) {
	const { value } = obj
	const { fanS } = m
	// Данные о ходе плавного пуска
	const soft = store.watchdog.softFan[section._id]

	// Инициализация
	if (acc.pre === undefined) {
		acc.pre = 1
		acc.bounce = 0
	}

	// Проверка и фиксация
	if (acc.pre !== soft?.count) {
		acc.bounce++
		if (!acc.start) acc.start = new Date()
		
		// compareTime(acc.delay, aCmd.delay)
	}

	// Сообщение
	if (acc.bounce > 2) {
		
	}
	// console.log(555, soft, acc)
}

module.exports = bounceVno




// Перегрев вводного кабеля (секция)
function cableS(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const sig = getSignal(section?._id, obj, 'cable')
	if (!sig) {
		delExtra(building._id, section._id, 'cable')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtra(building._id, section._id, 'cable', msg(building, section, 60))
		acc.alarm = true
	}
}
// module.exports = cableS