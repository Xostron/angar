const { data: store } = require('@store')
const { isAlr } = require('@tool/message/auto')
const { isErrMs } = require('@tool/message/plc_module')

// Авария "Модуль не в сети" для склада
function connect(bld, section, obj, s, se, m, automode, acc, data) {
	const isErr = isErrMs(bld._id)

	// Модули неисправны
	if (isErr) acc._alarm = true

	// Нет неисправностей модулей или сброс аварии - выкл аварии
	if (!isErr) {
		acc._alarm = false
	}
	// Для обычного склада и комби в режиме обычного неисправный модуль -> останов
	const x = bld.type === 'normal'
	const y = bld.type === 'combi' && isAlr(bld._id, automode)
	if (x || y) return acc?._alarm ?? false
	// Для склада холодильника и комбинированного в режиме холода
	// т.к. их агрегаты и испарители отслеживают свои модули на неисправность
	return false
}

module.exports = connect
