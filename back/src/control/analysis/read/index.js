const readJson = require('@tool/json').read
const read = require('@tool/control/read')

// Опрос модулей
function readM(obj) {
	return new Promise((resolve, reject) => {
		// json-файлы: конфигурация модулей
		readJson(['module', 'equipment', 'building'])
			.then(([module, equipment, building]) => {
				if (!building || !building?.length) return []
				// Подготовка модулей
				const arr = collect(module, equipment)
				// console.log(9999, arr)
				// Опрос модулей по сети
				return read(arr, obj)
			})
			.then((r) => {
				// let r = {}
				// arr.forEach((o) => {
				// 	if (!o) return
				// 	r.error ??= []
				// 	if (o.error) r.error.push(o.error)
				// 	delete o.error
				// 	r = { ...r, ...o }
				// })
				// console.log(99, 'Прочитанные данные с модулей', r)
				resolve(r)
			})
			.catch(reject)
	})
}

module.exports = readM

/**
 * Собираем модули на чтение
 *
 * Старая логика: Избыточный опрос. Когда на ПОСе несколько складов, в этих складах могут
 * быть общие модули, имеющие одинаковый IP, система делала опрос модулей для каждого
 * склада и соответсвенно одинаковые IP опрашивались по N раз. (N - кол-во складов)
 *
 * Новая логика: Уйти от избыточного опроса и опрашивать модули с одинаковыми
 * IP один раз за цикл.
 * Данная функция группирует модули по IP. Ключ _id ИД модуля, содержит в себе
 * ИД общих модулей, которые принадлежат разным складам на ПОСе.
 *
 *
 * @param {*} building
 * @param {*} module
 * @param {*} equipment
 */
function collect(module, equipment) {
	const map = new Map()
	module.forEach((m) => {
		if (!m?.ip || !m?.equipmentId) return
		
		const id = m.ip + (m?.slaveId ?? '')
		// Если в коллекции нет такого модуля, то добавляем и выходим из текущей итерации
		if (!map.has(id))
			return map.set(id, {
				...m,
				_id: [m._id],
				buildingId: [m.buildingId],
				...equipment[m.equipmentId],
			})

		// В коллекции уже есть такой модуль, редактируем ключ _id и buildingId
		// данный модуль может использоваться несколькими складами
		const cur = map.get(m.ip)
		cur._id.push(m._id)
		cur.buildingId.push(m.buildingId)
	})
	return [...map.values()]
}
