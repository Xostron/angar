const activityLog = require('@root/stat/activity')

/**
 * Middleware - это функция, которая выполняется при каждом соединении.
 * Посредники могут использоваться для логгирования, аутентификации/авторизации,
 * ограничения скорости подключения и т.д.
 * @param {*} io
 * @param {*} socket
 */
module.exports = function middleware(io, socket) {
	// Логирование
	socket.use((data, next) => {
		const [code, obj] = data
		console.log(777, 'middleware', code, obj)
		activityLog(code, obj)
		next()
	})
	io.use((socket, next) => {
		console.log(555, 'middleware')
		next()
	})
	io.use((socket, next) => {
		const token = socket.handshake.auth.token
		console.log(555, 'token', token)
		next()
	})
}
