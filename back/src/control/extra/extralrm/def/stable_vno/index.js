const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
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
function stableVno(building, section, obj, s, se, m, automode, acc, data) {
	// Данные о ходе плавного пуска
	const soft = store.watchdog.softFan[section._id]
	if (!soft) return
	// Инициализация
	if (acc.pre === undefined) {
		acc.pre = 1
		acc.bounce = 0
	}

	// Фиксируем число вентиляторов, когда начался дребезг
	if (acc.pre < soft?.count) acc.count = soft?.count
	if (acc.pre > soft?.count) acc.count = acc.pre

	// Произошло изменение кол-ва работающих ВНО
	if (acc.pre !== soft?.count) {
		acc.pre = soft?.count
		// Счетчик дребезгов
		acc.bounce++
		// Инициализация времени при первом включении
		if (!acc.start) {
			acc.start = new Date()
			acc.bounce = 0
		}
	}

	// Слежение, если за время t, вентилятор вкд/выкл более 3 раз то,
	// переключаем управление ВНО в особый режим
	// (пока действует данная блокировка у нас работает acc.count число ВНО)
	// Сброс означает переход ВНО в нормальный режим поддержания давления
	if (!compareTime(acc.start, 60000)) {
		if (acc.bounce > 2) {
			// Сообщение
			wrExtralrm(building._id, section._id, 'stableVno', msg(building, section, 40))
			// ВНО особый режим
			soft.count = acc?.count
			soft.stable = true
		}
	}
	// Обновление периода слежения
	else {
		acc.start = new Date()
		acc.bounce = 0
	}

	// Сброс системы и сообщений
	if (isReset(building._id)) {
		delExtralrm(building._id, section._id, 'stableVno')
		soft.stable = null
		acc.start = new Date()
		acc.bounce = 0
	}
	// console.log(555, soft, acc)
}

module.exports = stableVno
