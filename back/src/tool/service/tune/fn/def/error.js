const { ctrlV } = require('@tool/command/valve')

function error(stage, state, output, cmd) {
	ctrlV(vlv, vlv._build, 'stop')
	vlv._stage = null
	// console.log('777 ERROR', state)
}

module.exports = error
