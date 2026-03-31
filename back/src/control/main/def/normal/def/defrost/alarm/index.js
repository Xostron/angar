const o = { cooling: require('./def/cooling'), heat: require('./def/heat') }
const sm = require('@dict/submode')

function alarm(s, seB, building, acc, bdata) {
	if (acc.submode[0] === sm.heat[0]) return o.heat(s, seB, building, acc, bdata)
	return o.cooling(s, seB, building, acc, bdata)
}

module.exports = alarm
