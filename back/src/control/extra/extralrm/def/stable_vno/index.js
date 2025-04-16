const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const { isReset } = require('@tool/reset')
const { data: store } = require('@store')
const { msg } = require('@tool/message')
const _LIMIT = 3
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

	byChangeCount(building, section, acc, soft)
	byChangeFC(building, section, acc, soft, s)

	// Сброс системы и сообщений
	if (isReset(building._id)) {
		delExtralrm(building._id, section._id, 'stableVno')
		soft.stable = null
		acc.start = new Date()
		acc.bounce = 0
		delete acc.fc
	}
	// console.log(555, 'Задание', soft)
	console.log(555, 'Антидребезг', acc)
}

module.exports = stableVno

function byChangeCount(building, section, acc, soft) {
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
	if (!compareTime(acc.start, store._stableVno)) {
		if (acc.bounce < 2) return
		// Сообщение
		wrExtralrm(building._id, section._id, 'stableVno', msg(building, section, 40))
		// ВНО особый режим
		soft.count = acc?.count
		soft.fc.value = 100
		soft.stable = true
	} else {
		// Обновление периода слежения
		acc.start = new Date()
		acc.bounce = 0
	}
}

function byChangeFC(building, section, acc, soft, s) {
	acc.fc ??= {}
	// Инициализация
	if (acc.fc.pre === undefined) {
		acc.fc.pre = 100
		acc.fc.bounce = 0
		acc.fc.delta = 0
	}
	// Произошло изменение задание ПЧ
	// TODO следить за изменением задания в -и+
	if (acc.fc.pre !== soft?.fc?.value) {
		// Счетчик дребезгов
		console.log(888, acc.fc.delta, acc.fc.pre - soft?.fc?.value)
		if (soft?.fc?.value > 100 || soft?.fc?.value < 0) return

		if (acc.fc.delta !== acc.fc.pre - soft?.fc?.value) acc.fc.bounce++

		acc.fc.delta = acc.fc.pre - soft?.fc?.value
		acc.fc.pre = soft?.fc?.value

		// Инициализация времени при первом включении
		if (!acc.fc.start) {
			acc.fc.start = new Date()
			acc.fc.bounce = 0
		}
	}
	// Слежение
	const time = _LIMIT * s.fan.step * 1000
	if (!compareTime(acc.fc?.start, time)) {
		if (acc.fc.bounce < 2) return
		// Сообщение
		wrExtralrm(building._id, section._id, 'stableVno', msg(building, section, 40))
		// ВНО особый режим
		soft.count = acc?.count
		soft.fc.value = 100
		soft.stable = true
	} else {
		// Обновление периода слежения
		acc.fc.start = new Date()
		acc.fc.bounce = 0
	}
}
