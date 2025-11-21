const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Обдув
function blow(fnChange, acc, se, s, bld, clr) {
	onTime('blow', acc)
	
	return check.combi(fnChange, 'blow', acc, se, s, bld, clr)
}
module.exports = blow
