const { data, setTune } = require('@store')

// Данные от web: калибровка клапанов
module.exports = function sTune(io, socket) {
	socket.on('s_tune', (obj, callback) => {
		setTune(obj)
		// console.log(444,'s_tune', obj)
	})
}
