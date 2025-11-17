const { setCmd } = require('@tool/command/set')
const Aboc = require('@tool/abort_controller')

// Данные от web: команды управления
module.exports = function sOutput(io, socket) {
	socket.on('s_output', (obj, callback) => {
		setCmd(obj)
		Aboc.set()
		console.log(99, 's_output', obj)
	})
}
