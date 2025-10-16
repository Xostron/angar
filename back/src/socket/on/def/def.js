const { data: store } = require('@store')

function fn(code) {
	return function (io, socket) {
		socket.on(code, async (obj, callback) => {
			// Создать или сохранить изменения в json
			store.web ??= {}
			store.web[code] = { ...store.web[code], ...obj }
			console.log('web: Настройки сохранены', code)
		})
	}
}

module.exports = fn
