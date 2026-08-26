const { fnEnd, isRunning, fnInit } = require('./fn')

//
function buildHour(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// Склад не в работе - подсчет не ведем
	if (!isRunning(bld._id, m.fanBB, obj)) {
		delete acc?.start
		return
	}
	// Склад в работе считаем каждый цикл
	fnInit(acc)
	fnEnd(acc)
}

module.exports = buildHour
