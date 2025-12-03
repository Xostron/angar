const fnPrepare = require('./prepare')
const calc = require('./calc')
const {check,clear} = require('./check')

// Дополнительная вентиляция
function durVent(bld, obj, s, seB, m, resultFan, bdata) {
	console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n')
	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, resultFan, bdata)
	console.log('\tacc', prepare.acc)
	console.log(5500, '\tcmd', prepare.cmd)

	if (!check(prepare)) {
		clear(prepare)
		return
	}

	calc(prepare)

	console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n')
	return prepare.start
	// Условия доп. вентиляции (ДВ)
	// if (alrAuto || achieve) if (bld.type === 'normal') return start
}

module.exports = durVent
