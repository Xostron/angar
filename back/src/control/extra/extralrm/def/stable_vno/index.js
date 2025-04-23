const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { isReset } = require('@tool/reset')
const { data: store } = require('@store')
const { msg } = require('@tool/message')
const _LIMIT = 4
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
	// Данные о ходе плавного пуска ВНО
	const soft = store.watchdog.softFan[section._id]
	if (!soft) return

	const alrCount = byChangeCount(building, section, acc, soft)
	const alrFC = byChangeFC(building, section, acc, soft, s)

	// Авария
	if (alrCount || alrFC) {
		wrExtralrm(building._id, section._id, 'stableVno', msg(building, section, 40))
		// Антидребезг: вкл ВНО и флаг дребезга (soft.stable)
		soft.count = acc?.count
		soft.fc.value = 100
		soft.stable = true
	}

	// Сброс аварии
	if (isReset(building._id)) {
		delExtralrm(building._id, section._id, 'stableVno')
		soft.stable = null
		acc.queue = []
		acc.fcQueue = []
	}
	// console.log(555, 'Задание', soft)
	console.log(555, 'Антидребезг', acc, alrCount, alrFC)
}

module.exports = stableVno

/**
 * Дребезг ВНО (изменение кол-ва включенных ВНО)
 * такт - 1 итерация главного цикла
 *
 * Задача: Определить вкл/откл ВНО, например, 1 такт Работает ВНО1, 2 такт ВНО1+ВНО2, 3 такт ВНО1, 4 такт ВНО1+ВНО2
 * т.е. ВНО2 то включается то выключается - произошел дребезг =>  оставить в работе ВНО1+ВНО2 и вывести сообщение в "Сигналах"
 *
 * Алгоритм:
 * Фиксируем в массиве acc.queue кол-во включенных ВНО, и сравниваем пары друг с другом
 *
 * Пример 1: acc.queue = [1,2,1,2]: 1 такт Работает ВНО1, 2 такт ВНО1+ВНО2, 3 такт ВНО1, 4 такт ВНО1+ВНО2
 * Сравниваем пары из массива друг с другом (queue[0]===queue[2] && queue[1]===queue[3]), пары равны => обнаружен дребезг
 *
 * Пример2: [1,2,1,1]: 1такт ВНО1, 2такт ВНО1+ВНО2, 3такт ВНО1, 4такт ВНО1
 * Сравниваем пары из массива друг с другом (queue[0]=1 ===queue[2]=1 && queue[1]=2 != queue[3]=1), пары не равны - Все Ок
 * @param {*} building Склад
 * @param {*} section Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeCount(building, section, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 тактов)
	acc.queue ??= []
	acc.queue.push(soft?.count)
	if (acc.queue.length > _LIMIT) acc.queue.shift()
	acc.count = Math.max(...acc.queue)
	if (acc.queue[0] === acc.queue[2] && acc.queue[1] === acc.queue[3] && acc.queue[0] !== acc.queue[1]) return true
	return false
}

/**
 * Дребезг ВНО (частое изменение частоты ПЧ)
 * Принцип такоже как и function byChangeCount
 * @param {*} building Склад
 * @param {*} section Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeFC(building, section, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 тактов)
	acc.fcQueue ??= []
	acc.fcQueue.push(soft?.fc?.value)
	if (acc.fcQueue.length > _LIMIT) acc.fcQueue.shift()
	if (acc.fcQueue[0] === acc.fcQueue[2] && acc.fcQueue[1] === acc.fcQueue[3] && acc.fcQueue[0] !== acc.fcQueue[1]) return true
	return false
}
