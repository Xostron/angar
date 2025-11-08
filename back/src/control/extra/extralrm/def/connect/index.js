const { data: store } = require('@store')
const { isAlr } = require('@tool/message/auto')

// Авария "Модуль не в сети" для склада
function connect(bld, section, obj, s, se, m, automode, acc, data) {
	const isErrM = !!Object.keys(store.alarm?.module?.[bld._id] ?? {}).length

	// Модули неисправны
	if (isErrM) acc._alarm = true

	// Нет неисправностей модулей или сброс аварии - выкл аварии
	if (!isErrM) {
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
