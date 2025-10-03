const {zero} = require('@tool/zero')

// Данные от web: Обнуление счетчика сушки
module.exports = function sZero(io, socket) {
	socket.on('s_zero', (obj, callback) => {
		if (!obj?.buildingId) return
		console.log('s_zero', obj)
		zero(obj)
	})
}
