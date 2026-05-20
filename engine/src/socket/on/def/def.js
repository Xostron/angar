const { data: store } = require('@store')
const Aboc = require('@tool/abort_controller')

function fn(code) {
	return function (io, socket) {
		socket.on(code, async (obj, callback) => {
			// Создать или сохранить изменения в json
			store.web ??= {}
			store.web[code] = { ...store.web[code], ...obj }
			console.log('web: Настройки сохранены', code)
			Aboc.set()
		})
	}
}

module.exports = fn
