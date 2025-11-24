const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Обдув
function blow(fnChange, accCold, acc, se, s, bld, clr) {
	onTime('blow', acc)
	// При работе ВВ, испаритель будет попадать сюда (в обдув), когда ВВ выкл по таймеру,
	// испаритель будет попадать в off, когда время off закончится
	// будет check, откуда испаритель может попасть на любой режим.

	if (accCold.flagFinish) return
	// Если попали в обдув, то вызываем check, чтобы узнать куда испарителю работать дальше
	return check.combi(fnChange, 'blow', acc, se, s, bld, clr)
}
module.exports = blow
