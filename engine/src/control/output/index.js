const tracking = require('@tool/command/tracking')
const { setCmd } = require('@tool/command/set')
const { data: store } = require('@store')
const { collectMdls, mask, transform, prepare } = require('./fn')

/**
 * Преобразование команд управления в выхода модулей
 * @param {object} obj Глобальные данные
 * @return {} массив модулей с информацией оборудования + значение выхода (массив) для групповой записи выходов
 */
function convCmd(obj) {
	const { data, value, retain } = obj
	// Модули+подробная инфо без дубляжей
	const mdls = collectMdls(data?.module, data?.equipment)

	// Маска выходов
	const out = mask(value?.outputM, mdls)

	// Команды управления
	transform(store.command, mdls, out)

	// Команды управления клапаном (по времени)
	tracking(out, mdls, retain)

	// console.log(9944, out)
	// Подготовка данных для отправки на запись
	obj.output = prepare(out, mdls)
	// console.log(22,'На запись', obj.output)
	console.log(8811, store.command)
	// Очистка стека команд управления (импульсное управление)
	setCmd(null)
}

module.exports = convCmd
