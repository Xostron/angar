const { ctrlV } = require('@tool/command/valve')
const start = require('./start')

function wait(vlv, state) {
	// Подготовка: ожидаем открытия
	if (vlv._type === 'iopn' && state === 'opn') {
		ctrlV(vlv, vlv._build,'stop')
		vlv._stage = 'start'
		vlv._type = 'opn'
		start(vlv, state)
		// console.log('@@@333+')
	}
	// Подготовка: ожидаем закрытия
	if (vlv._type === 'icls' && state === 'cls') {
		ctrlV(vlv,vlv._build, 'stop')
		vlv._stage = 'start'
		vlv._type = 'cls'
		start(vlv, state)
		// console.log('@@@333++')
	}
	// console.log('@@@333 ', state, vlv)
}

module.exports = wait
