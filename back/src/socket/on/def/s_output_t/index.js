const { setCmdT } = require('@tool/command/set')

// Данные от web: команды управления
module.exports = function sOutputT(io, socket) {
	socket.on('s_output_t', (obj, callback) => {
		setCmdT(obj)
	})
}
