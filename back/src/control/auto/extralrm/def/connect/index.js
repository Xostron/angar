const { data: store, isReset, delModule, delDebMdl } = require('@store')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Авария "Модуль не в сети" для склада
function connect(building, section, obj, s, se, m, automode, acc, data) {
	const isErrM = !!Object.keys(store.alarm?.module?.[building._id] ?? {}).length

	if (!isErrM || isReset(building._id)) {
		delModule(building._id)
		removeAcc(obj.acc, { bldId: building._id }, 'module')
		acc.alarm = false
	}

	if (isReset(building._id)) delDebMdl()

	// Модули склада неисправны
	if (isErrM) {
		acc.alarm = true
	}
	return acc?.alarm ?? false
}

module.exports = connect
