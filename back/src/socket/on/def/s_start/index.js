const retainStart = require('@tool/retain/start')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_start', (obj, callback) => {
		// Создать или сохранить изменения в json
		retainStart(obj)
		console.log('s_start', obj)
	})
}
