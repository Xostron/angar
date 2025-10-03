const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { isReset } = require('@tool/reset')
const { data: store } = require('@store')
const { msg } = require('@tool/message')
const _LIMIT = 5 // размер очереди, история последних включенных ВНО,
const _LIMIT_TIME = 1 * 60 * 1000 //Если в течении 1 мин, кол-во ВНО прыгало 1-2-1-2, то Авария Дребезг
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
	// Данные о ходе плавного пуска ВНО
	const soft = store.watchdog.softFan[sect._id]
	if (!soft) return
	// Проверка на дребезг: аварии нет -> проверяем
	const isAlr = isExtralrm(bld._id, sect._id, 'stableVno')
	const alrCount = !isAlr ? byChangeCount(bld, sect, acc, soft) : true
	const alrFC = !isAlr ? byChangeFC(bld, sect, acc, soft, s) : true

	// Авария
	console.log(4, '=============', isAlr)
	if (alrCount || alrFC) {
		wrExtralrm(bld._id, sect._id, 'stableVno', msg(bld, sect, 40))
		// Антидребезг: вкл ВНО и флаг дребезга (soft.stable)
		soft.order = acc?.count ?? 0
		soft.fc ??= {}
		soft.fc.sp = 100
		soft.fc.value = true
		soft.stable = true
	}

	// Сброс аварии
	if (isReset(bld._id)) {
		delExtralrm(bld._id, sect._id, 'stableVno')
		soft.stable = null
		acc.queue = []
		acc.fcQueue = []
	}
	// console.log(555, 'Задание', soft)
	console.log(555, 'Антидребезг', acc)
	console.log(5551, 'Плавный пуск', soft)
	// console.log(5551, 'Антидребезг', acc)
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
 * _LIMIT_TIME минут (1 мин), т.е. если в течении 2х минут ВНО то вкл, то выкл - это дребезг
 *
 * Пример 1: acc.queue = [0,1,0,1,0]: 1 такт Работает ВНО1, 2 такт ВНО1+ВНО2, 3 такт ВНО1,
 * Сравниваем пары из массива друг с другом (queue[0]===queue[2] && queue[1]===queue[3]), пары равны
 * и время записей укладывается в 1 мин=> обнаружен дребезг
 * Если они время между первой и последней записью больше 1 мин, то это считаем нормой
 *
 * Пример2: [0,1,2]: 1такт ВНО1, 2такт ВНО1+ВНО2, 3такт ВНО1+2+3 - дребезга нет
 * Сравниваем пары из массива друг с другом (queue[0]=1 != queue[2]=3 ), пары не равны - Все Ок
 * @param {*} bld Склад
 * @param {*} sect Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeCount(bld, sect, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 изменений кол-ва включенных ВНО)
	acc.queue ??= []

	if (acc.queue.at(-1)?.count !== soft?.order && soft?.order >= 0) {
		console.log(
			'++++++++++++++',
			acc.queue.at(-1)?.count !== soft?.order,
			acc.queue.at(-1)?.count,
			soft?.order
		)
		acc.queue.push({ count: soft?.order, date: new Date() })
		console.log(1, '++++++++++', acc.queue)
	}
	// Размер очереди превышен удаляем первого из очереди
	if (acc.queue.length > _LIMIT) acc.queue.shift()
	acc.count = Math.max(...acc.queue.map((el) => el.count))
	// Первое и последнее изменение находится в диапазоне 1 мин? false - все ОК, true - подозрение на дребезг
	const isTime = acc?.queue?.[0]?.date - acc?.queue?.[_LIMIT - 1]?.date < _LIMIT_TIME

	// Анализ истории последних включенных ВНО, для определения дребезга, например:
	// [0,1,0,1,0] сравниваем пары [([0],[1])([2],[3])] и [([1],[2])([3],[4])]
	// и время между 1 и последним элементом <  1 мин
	const q1 =
		acc.queue?.[0]?.count === acc.queue?.[2]?.count &&
		acc.queue?.[1]?.count === acc.queue?.[3]?.count
	const q2 = acc.queue?.[2]?.count === acc.queue?.[4]?.count
	console.log(3, 'Relay+++++++++++', q1, q2, isTime)
	if (q1 && q2 && isTime) return true
	return false
}

/**
 * Дребезг ВНО (частое изменение частоты ПЧ)
 * Принцип такой же как и function byChangeCount
 * @param {*} bld Склад
 * @param {*} sect Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeFC(bld, sect, acc, soft) {
	// Формируем и контролируем очередь (сохранение последних 4 изменений кол-ва включенных ВНО)
	acc.fcQueue ??= []
	if (acc.fcQueue.at(-1)?.sp !== soft?.fc?.sp)
		acc.fcQueue.push({ sp: soft?.fc?.sp, date: new Date() })
	// Размер очереди превышен удаляем первого из очереди
	if (acc.fcQueue.length > _LIMIT) acc.fcQueue.shift()
	// Первое и последнее изменение находится в диапазоне 1 мин? false - все ОК, true - подозрение на дребезг
	const q1 =
		acc.fcQueue?.[0]?.sp === acc.fcQueue?.[2]?.sp &&
		acc.fcQueue?.[1]?.sp === acc.fcQueue?.[3]?.sp
	const q2 = acc.fcQueue?.[2]?.sp === acc.fcQueue?.[4]?.sp
	const isTime = acc.fcQueue?.[0]?.date - acc.fcQueue?.[_LIMIT - 1]?.date < _LIMIT_TIME
	console.log(
		3,
		'FC+++++++++++',
		q1,
		q2,
		'isTime = ',
		isTime,
		acc.fcQueue?.[0]?.date,
		'-',
		acc.fcQueue?.[_LIMIT - 1]?.date,
		'<',
		_LIMIT_TIME
	)
	if (q1 && q2 && isTime) {
		acc.count = soft?.order
		return true
	}
	return false
}
