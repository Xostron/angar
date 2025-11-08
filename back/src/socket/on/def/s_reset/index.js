const { reset } = require('@tool/reset')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_reset', (obj, callback) => {
		if (!obj?.buildingId) return
		// Вкл сброс аварий
		console.log('s_reset', obj)
		reset(obj)
	})
}
