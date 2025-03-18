const { data: store } = require('@store')

// Данные от web: Обнуление счетчика сушки
module.exports = function sZero(io, socket) {
	socket.on('s_zero', (obj, callback) => {
		console.log('s_zero', obj)
		store.zero = true
	})
}
