const equipment = require('@tool/equipment')

// Обработчик запроса рамы от клиента
module.exports = function sEquip(io, socket) {
	socket.on('s_equip', (arg, callback) => {
		console.log('s_equip', arg) // "world"
		equipment()
			.then((result) => {
				callback(result, 'ok')
			})
			.catch(console.log)
	})
}
