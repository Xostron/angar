const { data:store, setCmdT } = require('@store')

// Данные от web: команды управления
module.exports = function sOutputT(io, socket) {
	socket.on('s_output_t', (obj, callback) => {
		console.log('s_outputT', JSON.stringify(obj,null,' '))
		setCmdT(obj)
		// console.log('s_output_t1', store.commandT)
	})
}
