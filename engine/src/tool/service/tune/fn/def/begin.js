const prepare = require('./prepare')
const wait = require('./wait')
const start = require('./start')
const error = require('./error')

function begin(vlv, state) {
	switch (state) {
		// Открывается/закрывается
		case 'iopn':
		case 'icls':
			vlv._stage = 'wait'
			vlv._type = state
			wait(vlv, state)
			break
		// Открыт/Закрыт
		case 'cls':
		case 'opn':
			vlv._stage = 'start'
			vlv._type = state
			start(vlv, state)
			break
		// Частично открыт
		case 'popn':
			vlv._stage = 'prepare'
			vlv._type = null
			prepare(vlv, state)
			break
		// Неисправность state===alr
		default:
			vlv._stage = 'error'
			error(vlv, state)
	}
}

module.exports = begin
