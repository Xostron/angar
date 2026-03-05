const deniedCold = require('./cold')
const deniedCombi = require('./combi')
const offDenied = require('./off_denied')
const offByTcnl = require('./off_tcnl')

module.exports = {
	cold: deniedCold,
	combi: deniedCombi,
	off: offDenied,
	offByTcnl,
}
