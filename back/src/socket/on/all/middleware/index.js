const {webLog} = require('@root/stat/activity')
const {state} = require('@root/client/state')
/**
 * Middleware - это функция, которая выполняется при каждом соединении и обращении клиента
 * Посредники могут использоваться для логгирования, аутентификации/авторизации,
 * ограничения скорости подключения и т.д.
 * @param {*} io
 * @param {*} socket
 */
module.exports = function middleware(io, socket) {
	// Перехват клиента
	socket.use((data, next) => {
		const [code, obj] = data
		// Логирование действий пользователя
		webLog(code, obj)
		console.log(999003, code)
		next()
	})
	// При подключении нового клиента
	io.use((socket, next) => {
		next()
	})

	io.use((socket, next) => {
		const token = socket.handshake.auth.token
		next()
	})
}
