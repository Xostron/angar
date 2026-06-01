const { store } = require('@store')

/**
 * Преобразование модулей и разбиение на потоки, с сохранением в store.parts
 * Чтобы в каждом цикле не делать лишние расчеты модулей, расчеты зависят от флага
 * обновления рамы
 * @param
 * @returns {{mdls:object[],parts:object[][]}} mdls - массив рамы модуль+оборудование
 * parts - распределенный mdls на подмассивы, каждый подмассив это поток
 */
function collect(count) {
	// Если нет флага обновления рамы ИЛИ нет модулей ИЛИ нет оборудования - выходим
	if (!store._handshake || !store.module.length || !Object.keys(store.equipment).length) return

	// Рама: Преобразуем модуль+оборудование, убираем дубляжи
	store.mdls = collectMdls(store.module, store.equipment)

	// Разбиваем модули на потоки и сохраняем в store.parts
	store.parts = partition(store.mdls, count)
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
 * @param {object} equipment Рама оборудования
 * @return {object[]} Массив модулей (модуль+equipment) без дубляжей
 */
function collectMdls(module, equipment) {
	// Если нет рамы, выходим
	if (!module?.length || !Object.keys(equipment ?? {})?.length) return []

	// Проход по модулям
	const map = new Map()
	module.forEach((m) => {
		const id = m.ip + m.equipmentId + (m?.slave ?? '')
		// Если в коллекции нет такого модуля, то добавляем и выходим из текущей итерации
		if (!map.has(id))
			return map.set(id, {
				...m,
				_id: [m._id],
				buildingId: [m.buildingId],
				...equipment[m.equipmentId],
			})

		// В коллекции уже есть такой модуль, редактируем ключ _id, buildingId
		// данный модуль может использоваться несколькими складами
		const cur = map.get(id)
		cur._id.push(m._id)
		cur.buildingId.push(m.buildingId)
	})
	// console.log(9911, [...map.values()])
	return [...map.values()]
}

/**
 * Распределение модулей по потокам
 * @param {*} mdls Массив модулей на чтение
 * @param {*} count Кол-во потоков
 * @returns {object[][]} Возвращаем подмассивы с модулями,
 * для каждого потока свой набор модулей
 */
function partition(mdls, count) {
	if (!mdls?.length) return []
	// Массив массивов
	const parts = new Array(count).fill()
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
