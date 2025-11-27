const { wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store')
const { msg } = require('@tool/message')
const byChangeCount = require('./fn')

/**
 * По секциям
 * Дребезг вентиляторов ВНО
 * @param {*} bld Рама склада
 * @param {*} sect Рама секции
 * @param {*} obj Глобальный объект цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns
 */
function stableVno(bld, sect, obj, s, se, m, automode, acc, data) {
	// Если в течении 30 сек, кол-во ВНО прыгало 1-2-1-2, то Авария Дребезг
	// console.log(55, 'stableVno', acc)
	const LIMIT_TIME = (s?.fan?.debSoft ?? 30) * 1000
	// Данные о ходе плавного пуска ВНО
	const soft = store.watchdog.softFan[sect._id]
	if (!soft) return
	// Проверка на дребезг: аварии нет -> проверяем
	const isAlr = isExtralrm(bld._id, sect._id, 'stableVno')
	const alrCount = !isAlr ? byChangeCount(bld, sect, acc, soft, s, LIMIT_TIME) : true
	// const alrFC = !isAlr ? byChangeFC(bld, sect, acc, soft, s, LIMIT_TIME) : true

	// Возник антидребезг
	if (alrCount) {
		// Вывод сообщения, плавный пуск фиксирует кол-во включенных ВНО и ВНО+ПЧ = 20%
		wrExtralrm(bld._id, sect._id, 'stableVno', msg(bld, sect, 40))
		// Антидребезг: вкл ВНО и флаг дребезга (soft.stable)
		soft.order = acc?.count ?? 0
		soft.fc ??= {}
		soft.fc.sp = s.fan.min
		soft.fc.value = true
		soft.stable = true
		acc._alarm = true
	} else {
		// Сброшен антидребезг
		soft.stable = null
		acc._alarm = false
	}
}

module.exports = stableVno
