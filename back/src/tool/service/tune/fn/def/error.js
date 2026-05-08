const { ctrlV } = require('@tool/command/module_output')

function error(vlv, state) {
	ctrlV(vlv, vlv._build, 'stop')
	vlv._stage = null
	// console.log('777 ERROR', state)
}

module.exports = error
