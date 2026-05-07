const tracking = require('@tool/command/tracking')
const { setCmd } = require('@tool/command/set')
const { data: store } = require('@store')
const { aFind } = require('@tool/obj')

/**
 * Преобразование команд управления в выхода модулей
 * @param {object} obj Глобальные данные
 * @return {} массив модулей с информацией оборудования + значение выхода (массив) для групповой записи выходов
 */
function convCmd(obj) {
	const { data, value, retain } = obj
	const cmd = store.command
	// Модули+подробная инфо
	const mdls = data?.module.map((el) => ({
		...el,
		...data?.equipment[el.equipmentId],
	}))

	// Маска выходов DO
	const out = {}
	// Прочитанные значения с модулей выхода
	for (const idM in value?.outputM) {
		if (idM == 'null') continue
		if (!value?.outputM?.[idM]) {
			const o = aFind(mdls, idM)
			out[idM] = Array(o?.wr?.channel).fill(0)
			continue
		}
		// Маска выходов (копия прочитанных выходов)
		out[idM] = value?.outputM?.[idM]?.map((el) => {
			return el || 0
		})
	}
	
	// Команды управления - частично переписывают Маску выходов
	if (cmd)
		// по складам
		for (const build in cmd) {
			// по модулям склада
			for (const idM in cmd?.[build]) {
				// по каналу модуля
				for (const channel in cmd?.[build]?.[idM]) {
					out[idM] ??= []
					out[idM][+channel] = cmd?.[build]?.[idM]?.[channel]
				}
			}
		}

	console.log('\x1b[32m%s\x1b[0m', 'Выхода: ', JSON.stringify(out, null, ' '))
	// console.log(8884,cmd)

	// Команды управления с таймером
	tracking(out, retain)

	// Очистка стека команд управления (импульсное управление)
	setCmd(null)

	obj.output = collect(out, mdls)
}

module.exports = convCmd

/**
 * Собираем модули для записи
 *
 * Новая логика: один и тот же модуль может использоваться несколькими складами,
 * поэтому необходимо значения выходов сложить (ИЛИ)
 * @param {*} output
 * @param {*} out
 * @param {*} mdls
 */
function collect(out, mdls) {
	const map = new Map()
	mdls.forEach((m) => {
		// Если нет значения у модуля - пропускаем модуль
		if (!out[m._id]) return

		const id = m.ip + (m?.slaveId ?? '')
		// Если в коллекции нет такого модуля, то добавляем и выходим из текущей итерации
		if (!map.has(id))
			return map.set(id, {
				...m,
				_id: [m._id],
				buildingId: [m.buildingId],
				value: out[m._id],
			})

		// В коллекции уже есть такой модуль, редактируем ключ _id, buildingId, value
		// данный модуль может использоваться несколькими складами
		const cur = map.get(id)
		cur._id.push(m._id)
		cur.buildingId.push(m.buildingId)
		cur.value = cur.value.map((el, i) => +el +  +(out?.[m._id]?.[i] ?? 0))
		
	})
	return [...map.values()]
}
