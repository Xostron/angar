const { data: store,  isReset, delModule } = require('@store')

// Авария "Модуль не в сети" для склада
function connect(building, section, obj, s, se, m, automode, acc, data) {
	const isErrM = !!Object.keys(store.alarm?.module?.[building._id] ?? {}).length
	
	if (!isErrM || isReset(building._id)) {
		delModule(building._id)
		acc.alarm = false
	}
	// Модули склада неисправны
	if (isErrM) {
		acc.alarm = true
	}
	return acc?.alarm ?? false 
}

module.exports = connect