const { data: store } = require('@store')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_start', (obj, callback) => {
		store.web ??= {}
		store.web.s_start = { ...store.web.s_start, ...obj }
		console.log('s_start', obj)
	})
}
