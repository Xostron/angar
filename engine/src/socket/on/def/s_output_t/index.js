const { setCmdT } = require('@tool/command/set')
const Aboc = require('@tool/abort_controller')

// Данные от web: команды управления
module.exports = function sOutputT(io, socket) {
	socket.on('s_output_t', (obj, callback) => {
		setCmdT(obj)
		Aboc.set()
	})
}
