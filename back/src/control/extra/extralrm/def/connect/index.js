const { data: store } = require('@store')
const { isReset } = require('@tool/reset')
const { delDebMdl } = require('@tool/message/plc_module')
const { isAlr } = require('@tool/message/auto')

// Авария "Модуль не в сети" для склада
function connect(bld, section, obj, s, se, m, automode, acc, data) {
	const isErrM = !!Object.keys(store.alarm?.module?.[bld._id] ?? {}).length

	// Сброс аварии (удаление аварии из списка антидребезга)
	if (isReset(bld._id)) delDebMdl()

	// Модули неисправны
	if (isErrM) acc.alarm = true

	// Нет неисправностей модулей или сброс аварии - выкл аварии
	if (!isErrM || isReset(bld._id)) {
		acc.alarm = false
	}
	// Для обычного склада и комби в режиме обычного неисправный модуль -> останов
	const x = bld.type === 'normal'
	const y = bld.type === 'combi' && isAlr(bld._id, automode)
	if (x || y) return acc?.alarm ?? false
	// Для склада холодильника и комбинированного в режиме холода
	// т.к. их агрегаты и испарители отслеживают свои модули на неисправность
	return false
}

module.exports = connect
