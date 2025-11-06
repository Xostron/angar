const tracking = require('@tool/command/tracking')
const { setCmd } = require('@tool/command/set')
const { data: store } = require('@store')
const { aFind } = require('@tool/obj')
// Преобразование команд управления в выхода модулей
/**
 * @param {object} obj Глобальные данные
 * @return {} массив модулей с информацией оборудования + значение выхода (массив) для групповой записи выходов
 */
function convCmd(obj) {
	const { data, value, output, retain } = obj
	const cmd = store.command
	// Модули+подробная инфо
	const m = data?.module.map((el) => ({
		...el,
		...data?.equipment[el.equipmentId],
	}))
	// Маска выходов DO
	const out = {}

	// Прочитанные значения с модулей выхода key=moduleId
	for (const key in value?.outputM) {
		if (key == 'null') continue
		if (!value?.outputM?.[key]) {
			const o = aFind(m, key)
			out[key] = Array(o?.wr?.channel).fill(0)
			continue
		}
		// Маска выходов (копия прочитанных выходов)
		out[key] = value?.outputM?.[key]?.map((el) => {
			return el || 0
		})
	}
	// Команды управления - частично переписывают Маску выходов
	if (cmd)
		// по складам
		for (const build in cmd) {
			// по модулям склада
			for (const mdl in cmd?.[build]) {
				// по каналу модуля
				for (const channel in cmd?.[build]?.[mdl]) {
					out[mdl] ??= []
					out[mdl][+channel] = cmd?.[build]?.[mdl]?.[channel]
				}
			}
		}
	// Команды управления с таймером
	tracking(out, retain)

	// Очистка стека команд управления (импульсное управление)
	setCmd(null)

	// Формирование данных на запись в модули Output
	for (const o of m) {
		if (out[o._id]) output[o._id] = { ...o, value: out[o._id] }
	}
}

module.exports = convCmd
