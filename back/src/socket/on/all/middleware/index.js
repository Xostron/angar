/**
 * Middleware - это функция, которая выполняется при каждом соединении.
 * Посредники могут использоваться для логгирования, аутентификации/авторизации,
 * ограничения скорости подключения и т.д.
 * @param {*} io
 * @param {*} socket
 */
module.exports = function middleware(io, socket) {
	io.use((socket, next) => {
		// console.log('middleware');
		next();
	});
	io.use((socket, next) => {
		const token = socket.handshake.auth.token;
		// console.log('token', token);
		next();
	});
};
