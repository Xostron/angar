const innerCold = require('./cold')
const innerCombi = require('./combi')
const innerNormal = require('./normal')

const defInnerSec = {
	normal: innerNormal,
	combi: innerCombi,
	cold: innerCold,
}

module.exports = defInnerSec
