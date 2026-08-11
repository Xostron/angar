const { check1, fnStart, fnEnd, fnDay } = require('./fn')

// Суточные моточасы режима сушка
function rdDrying(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// acc.start ??= new Date()
	// acc.day ??= new Date().getDate() + 1
	// acc.total ??= {}
	// acc.total[acc.day]??=0
	fnDay(acc)
	if (!check1(bld._id, obj)) {
		fnEnd(acc)
		return console.log('Запрет check1')
	}
	fnStart(bld, m, obj, acc)
	console.log(11, acc)
}

module.exports = rdDrying
