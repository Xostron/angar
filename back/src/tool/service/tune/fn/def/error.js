const { ctrlV } = require('@tool/command/module_output')

function error(vlv, state) {
	ctrlV(vlv, vlv._build, 'stop')
	vlv._stage = null
}

module.exports = error
