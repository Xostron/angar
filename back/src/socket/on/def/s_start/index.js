const retainStart = require('@tool/retain/start')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_start', (obj, callback) => {
		retainStart(obj)
		console.log('s_start', obj)
	})
}