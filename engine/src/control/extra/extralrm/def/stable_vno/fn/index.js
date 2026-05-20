const _LIMIT = 5 // размер очереди, история последних включенных ВНО,

/**
 * Дребезг ВНО (изменение кол-ва включенных ВНО)
 * @param {*} bld Склад
 * @param {*} sect Секция
 * @param {*} acc Аккумулятор
 * @param {*} soft Данные о ходе плавного пуска ВНО
 * @return {boolean} true - дребезг!, false - все ОК
 */
function byChangeCount(bld, sect, acc, soft, s, LIMIT_TIME) {
	// Формируем и контролируем очередь (сохранение последних 4 изменений кол-ва включенных ВНО)
	acc.queue ??= []

	if (acc.queue.at(-1)?.count !== soft?.order && soft?.order >= -1) {
		acc.queue.push({ count: soft?.order, date: new Date() })
	}
	// Размер очереди превышен удаляем первого из очереди
	if (acc.queue.length > _LIMIT) acc.queue.shift()
	acc.count = Math.max(...acc.queue.map((el) => el.count))
	// Первое и последнее изменение находится в диапазоне 1 мин? false - все ОК, true - подозрение на дребезг
	const isTime = acc?.queue?.at(-1)?.date - acc?.queue?.[0]?.date < LIMIT_TIME

	// Анализ истории последних включенных ВНО, для определения дребезга, например:
	// [0,1,0,1,0] сравниваем пары [([0],[1])([2],[3])] и [([1],[2])([3],[4])]
	// и время между 1 и последним элементом <  1 мин
	const q1 =
		acc.queue?.[0]?.count === acc.queue?.[2]?.count &&
		acc.queue?.[1]?.count === acc.queue?.[3]?.count &&
		acc.queue?.[2]?.count === acc.queue?.[4]?.count
	if (q1 && isTime) return true
	return false
}

module.exports = byChangeCount