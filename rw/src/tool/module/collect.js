const { store } = require('@store')
/**
 * Собираем модули на чтение
 * Данная функция группирует модули по IP+slave {ip+slave:{_id:[],...}}. Ключ _id ИД модуля, содержит в себе
 * ИД общих модулей, которые принадлежат разным складам на ПОСе.
 *
 * @returns {object[]} {ip+slave:{_id:[],...m[el],...equipment[el]}}
 */
function collect() {
	const { module, equipment } = store
	const map = new Map()
	module.forEach((m) => {
		if (!m?.ip || !m?.equipmentId) return

		const id = m.ip + (m?.slave ?? '')
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

module.exports = collect
