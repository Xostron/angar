const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { isReset } = require('@tool/reset')
const { data: store } = require('@store')
const { msg } = require('@tool/message')
const _LIMIT = 3 // размер очереди, история кол-ва включенных ВНО,
const _LIMIT_TIME = 2 * 60 * 1000 //Если в течении 2 мин, кол-во ВНО прыгало 1-2-1-2, то Авария Дребезг
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
	// console.log(555, 'Антидребезг', acc, alrCount, alrFC)
}

module.exports = stableVno

/**
 * Дребезг ВНО (изменение кол-ва включенных ВНО)
 * такт - момент изменения кол-ва включенных вентиляторов
 *
 * Задача: Определить вкл/откл ВНО, например, 1 такт Работает ВНО1, 2 такт ВНО1+ВНО2, 3 такт ВНО1,
 * т.е. ВНО2 то включается то выключается - произошел дребезг =>  оставить в работе ВНО1+ВНО2 и вывести сообщение в "Сигналах"
 *
 * Алгоритм:
 * Фиксируем в массиве acc.queue {кол-во включенных ВНО, время изменения} - данное изменение добавляем в массив
 *  при условии, что оно не равно последней записи в массиве.
 * В образовавшемся массиве из _LIMIT=3 записей, сравниваем крайнюю пару и проверяем что разница между первой и последней записью была не более
 * _LIMIT_TIME минут (2мин), т.е. если в течении 2х минут ВНО то вкл, то выкл - это дребезг
 *
 * Пример 1: acc.queue = [2,1,2]: 1 такт Работает ВНО1, 2 такт ВНО1+ВНО2, 3 такт ВНО1,
 * Сравниваем пары из массива друг с другом (queue[0]===queue[2] && queue[1]===queue[3]), пары равны
 * и время записей укладывается в 2 мин=> обнаружен дребезг
 * Если они время между первой и последней записью больше 2 мин, то это считаем нормой
 *
 * Пример2: [1,2,3]: 1такт ВНО1, 2такт ВНО1+ВНО2, 3такт ВНО1+2+3 - дребезга нет
 * Сравниваем пары из массива друг с другом (queue[0]=1 != queue[2]=3 ), пары не равны - Все Ок
 * @param {*} building Склад
 * @param {*} section Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeCount(building, section, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 изменений кол-ва включенных ВНО)
	acc.queue ??= []
	if (acc.queue[0]?.count !== soft?.count) acc.queue.push({ count: soft?.count, date: new Date() })
	// Размер очереди превышен удаляем первого из очереди
	if (acc.queue.length > _LIMIT) acc.queue.shift()
	acc.count = Math.max(...acc.queue.map((el) => el.count))
	// Первое и последнее изменение находится в диапазоне 2 мин? false - все ОК, true - подозрение на дребезг
	const isTime = acc[0]?.date - acc?.[2]?.date < _LIMIT_TIME
	if (acc.queue[0] === acc.queue[2] && acc.queue[0] !== acc.queue[1] && isTime) return true
	return false
}

/**
 * Дребезг ВНО (частое изменение частоты ПЧ)
 * Принцип такой же как и function byChangeCount
 * @param {*} building Склад
 * @param {*} section Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeFC(building, section, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 изменений кол-ва включенных ВНО)
	acc.fcQueue ??= []
	if (acc.fcQueue[0]?.value !== soft?.fc?.value) acc.fcQueue.push({ value: soft?.fc?.value, date: new Date() })
	// Размер очереди превышен удаляем первого из очереди
	if (acc.fcQueue.length > _LIMIT) acc.fcQueue.shift()
	// Первое и последнее изменение находится в диапазоне 2 мин? false - все ОК, true - подозрение на дребезг
	const isTime = acc[0]?.date - acc?.[2]?.date < _LIMIT_TIME
	if (acc.fcQueue[0] === acc.fcQueue[2] && acc.fcQueue[0] !== acc.fcQueue[1] && isTime) return true
	return false
}
