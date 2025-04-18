const { ctrlV } = require('@tool/command/module_output')
const wait = require('./wait')

function prepare(vlv, state) {
	// Команда на управление клапаном
	ctrlV(vlv, vlv._build,'open')
	// Переход на стадию
	vlv._stage = 'wait'
	// Действие клапана (открывается/закрывается)
	vlv._type = 'iopn'
	wait(vlv, state)
}

module.exports = prepare
