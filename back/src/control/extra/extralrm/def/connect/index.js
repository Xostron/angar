const { data: store, isReset, delModule, delDebMdl } = require('@store')

// Авария "Модуль не в сети" для склада
function connect(building, section, obj, s, se, m, automode, acc, data) {
	const isErrM = !!Object.keys(store.alarm?.module?.[building._id] ?? {}).length

	// Сброс аварии (удаление аварии из списка антидребезга)
	if (isReset(building._id)) delDebMdl()

	// Модули неисправны
	if (isErrM) acc.alarm = true

	// Нет неисправностей модулей или сброс аварии - выкл аварии
	if (!isErrM || isReset(building._id)) {
		acc.alarm = false
		// delModule(building._id)
	}

	return acc?.alarm ?? false
}

module.exports = connect
