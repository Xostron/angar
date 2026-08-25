const { fnEnd, isRunning, fnInit } = require('./fn')

function buildHour(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!isRunning(bld._id, m.fanBB, obj)) {
		delete acc?.start
		return
	}
	fnInit(acc)
	fnEnd(acc)
}

module.exports = buildHour
