const coldScard = require('./cold')
const combiScard = require('./combi')
const normalScard = require('./normal')

const defScard = {
	normal: normalScard,
	combi: combiScard,
	cold: coldScard,
}

module.exports = defScard
