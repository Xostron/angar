const disconnect = require('../all/disconnect')
const middleware = require('../all/middleware')
const equipment = require('@tool/equipment')
const test = require('./test')
const sEquip = require('./s_equip')
const sOutput = require('./s_output')
const sTune = require('./s_tune')
const sStart = require('./s_start')
const sOutputT = require('./s_output_t')

const sReset = require('./s_reset')
const sZero = require('./s_zero')
const sWarming = require('./s_warming')
const fn = require('./def.js')

module.exports = function onConnection(io, socket) {
	// const user = socket.request.user;
	console.log('Connect socket.id', socket.id)
	// console.log('socket cookie', socket.handshake.cookie)
	// console.log('query', socket.handshake.query)
	// console.log('socket.request.user', socket.request.user)

	// Посредники
	middleware(io, socket)
	// Отключение сокета
	disconnect(io, socket)

	// Регистрируем обработчики
	test(io, socket)
	sEquip(io, socket)
	sOutput(io, socket)
	sOutputT(io, socket)
	sWarming(io, socket)
	sTune(io, socket)
	sStart(io, socket)
	sReset(io, socket)
	sZero(io, socket)
	fn('s_auto_mode')(io, socket)
	fn('s_product')(io, socket)
	fn('s_mode')(io, socket)
	fn('s_sens')(io, socket)
	fn('s_fan')(io, socket)
	fn('s_setting_au')(io, socket)
	// Ответ конкретному клиенту
	equipment().then((data) => {
		socket.emit('c_equip', data)
	})
}
