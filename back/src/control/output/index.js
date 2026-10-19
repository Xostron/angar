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
	// console.log(11, store.command['69f9dd09c35ea05200898cd8']['69f9dd09c35ea05200898d17'])
	transform(store.command, mdls, out)
	// console.log(22, out['192.168.21.126.66cee314eeb92a11d628b024.'])
	// Команды управления клапаном (по времени)
	tracking(out, mdls, retain)

	// console.log(9944, out)
	// Подготовка данных для отправки на запись
	obj.output = prepare(out, mdls)
	// Очистка стека команд управления (импульсное управление)
	setCmd(null)
}

module.exports = convCmd
