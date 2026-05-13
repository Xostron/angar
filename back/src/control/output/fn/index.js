const { getMdl, getId } = require('@tool/get/module')

/**
 * Собираем модули выходов по IP (слияние модулей с одинаковыми IP)
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
		const id = m.ip + (m?.slaveId ?? '')
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
 * Маска выходов
 * Маска создается на основе прочитанных данных с модулей выхода
 *
 * Маска формируется с ключами IP+slaveID, чтобы отфильтровать дублирующиеся модули,
 * те модули, которые одновременно используются в нескольких складах на данном ПОСе
 *
 * @param {object} outputM Значения выходов модулей (с дублирующимися модулями)
 * @param {object[]} mdls Массив модулей (модуль+equipment) без дубляжей
 * @returns {object} out Маска - Объект с ключами IP и значениями выходов
 */
function mask(outputM, mdls) {
	// Маска выходов DO
	const out = {}
	// Если нет данных, выходим
	if (!mdls?.length || !Object.keys(outputM ?? {})?.length) return out

	// Проход по значениям модулей выходов
	for (const idM in outputM) {
		if (idM == 'null') continue
		// Рама соответсвующего модуля
		const { mdl, id } = getMdl(mdls, idM)

		// Если модуль уже добавлен, пропускаем итерацию
		if (out[id]) continue

		// Модуль добавляется первый раз
		// Если значение выходов = undefined (модуль не доступен)
		// то заполняем маску нулями
		if (!outputM?.[idM]) {
			out[id] = Array(mdl?.wr?.channel).fill(0)
			continue
		}

		// Значение имеется
		out[id] = outputM?.[idM]?.map((el) => el || 0)
	}
	// console.log(9922, out)
	return out
}

/**
 * Преобразование маски - на основе команд управления выходами
 * Слияние значений выходов с учетом, того что одни и теже модули
 * используются разными складами
 * @param {object} cmd Команды управления
 * @param {object[]} mdls Массив модулей (без дубляжей)
 * @param {object} out Маска (слияние маски и команд управления)
 */
function transform(cmd, mdls, out) {
	// Нет команд управления, выходим
	if (!cmd) return
	// Команды управления - частично переписывают Маску выходов
	// по складам
	for (const idB in cmd) {
		// console.log(1144, cmd[idB])
		// по модулям склада
		for (const idM in cmd?.[idB]) {
			// по каналу модуля
			for (const channel in cmd?.[idB]?.[idM]) {
				// Рама соответсвующего модуля
				// console.log(1122, idM)
				const { mdl, id } = getMdl(mdls, idM)
				// console.log(1155, id)
				if (!mdl) {
					console.log(1177, 'не найден модуль', cmd[idB], idM)
					continue
				}
				// Частичная перезапись значений выходов
				out[id] ??= []
				out[id][+channel] = cmd?.[idB]?.[idM]?.[channel]
			}
		}
	}
}

/**
 * Подготовка данных для отправки на запись:
 * удаление дублирующихся модулей по IP
 * @param {*} out
 * @param {*} mdls
 * @return {object[]} Массив модулей (рама + значения выходов)
 */
function prepare(out, mdls) {
	const arr = []

	// По ключу out
	for (const id in out) {
		// Рама модуля (module+equipment)
		const mdl = mdls.find((el) => getId(el.ip, el.slaveId) === id)
		arr.push({ ...mdl, value: out[id] })
	}
	return arr
	// mdls.forEach((m) => {
	// 	// Ключи out
	// 	const id = m.ip + (m?.slaveId ?? '')

	// 	// Если нет значения у модуля - пропускаем
	// 	if (!out[id]) return

	// 	// Если в коллекции нет такого модуля, то добавляем и выходим из текущей итерации
	// 	if (!map.has(id))
	// 		return map.set(id, {
	// 			...m,
	// 			_id: [m._id],
	// 			buildingId: [m.buildingId],
	// 			value: out[m._id],
	// 		})

	// 	// В коллекции уже есть такой модуль, редактируем ключ _id, buildingId, value
	// 	// данный модуль может использоваться несколькими складами
	// 	const cur = map.get(id)
	// 	cur._id.push(m._id)
	// 	cur.buildingId.push(m.buildingId)
	// 	// cur.value = cur.value.map((el, i) => +el + +(out?.[m._id]?.[i] ?? 0))
	// })
	// return [...map.values()]
}

module.exports = { collectMdls, mask, transform, prepare, getMdl }
