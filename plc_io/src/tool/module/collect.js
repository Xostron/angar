const { store } = require('@store')

/**
 * Преобразование модулей и разбиение на потоки, с сохранением в store.parts
 * Чтобы в каждом цикле не делать лишние расчеты модулей, расчеты зависят от флага
 * обновления рамы
 * @param
 * @returns {{mdls:object[],parts:object[][]}} mdls - массив рамы модуль+оборудование
 * parts - распределенный mdls на подмассивы, каждый подмассив это поток
 */
function collect(max) {
	// Если нет флага обновления рамы ИЛИ нет модулей ИЛИ нет оборудования - выходим
	if (!store._handshake || !store.module.length || !max) return

	// Рама: Преобразуем модуль+оборудование, убираем дубляжи
	store.mdls = collectMdls(store.module)
	// Разбиваем модули на потоки и сохраняем в store.parts
	store.parts = partition(store.mdls, max)
}

/**
 * Собрать массив уникальных модулей:
 * Уйти от избыточного опроса и опрашивать модули с одинаковыми
 * id = m.ip + m.equipmentId +(m?.slave ?? '') один раз за цикл.
 * Данная функция группирует модули по id = m.ip + m.equipmentId +(m?.slave ?? '').
 * Ключ _id ИД модуля, содержит в себе ИД общих модулей,
 * которые принадлежат разным складам на ПОСе.
 *
 * @param {object[]} module Рама модулей
 * @return {object[]} Массив модулей (модуль+оборудование) без дубляжей
 */
function collectMdls(module) {
	// Если нет рамы, выходим
	if (!module?.length) return []

	// Проход по модулям
	const map = new Map()
	module.forEach((m) => {
		const id = m.ip + m.equipmentId + (m?.slave ?? '')
		// Если в коллекции нет такого модуля, то добавляем и выходим из текущей итерации
		if (!map.has(id)) return map.set(id, m)

		// В коллекции уже есть такой модуль, редактируем ключ _id, buildingId
		// данный модуль может использоваться несколькими складами
		const cur = map.get(id)
		cur._id.push(...m._id)
		cur.buildingId.push(...m.buildingId)
	})
	return [...map.values()]
}

/**
 * Распределение модулей по потокам
 * @param {*} mdls Массив модулей на чтение
 * @param {*} count Кол-во потоков
 * @returns {object[][]} Возвращаем подмассивы с модулями,
 * для каждого потока свой набор модулей
 */
function partition(mdls, max) {
	if (!mdls?.length || !max) return []
	// Массив массивов
	const parts = new Array(max).fill()
	let i = 0
	// По модулям
	while (i < mdls.length) {
		// По потокам
		parts.forEach((_, j) => {
			// Создание подмассива
			if (!(parts[j] instanceof Array)) parts[j] = []
			// Добавляем модуль в подмассив
			mdls[i] ? parts[j].push(mdls[i]) : null
			// следующий модуль
			i++
		})
	}
	// Возвращаем результат массив с подмассивами, кол-во подмассивов равно кол-ву потоков
	return parts
}

module.exports = collect
