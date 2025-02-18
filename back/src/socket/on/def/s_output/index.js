const { data, setCmd } = require('@store')

// Данные от web: команды управления
module.exports = function sOutput(io, socket) {
	socket.on('s_output', (obj, callback) => {
		setCmd(obj)
		console.log(99,'s_output', obj)
	})
}

