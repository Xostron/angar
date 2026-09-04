const modbus = require('jsmodbus')
const net = require('net')
const { regist } = require('./fn')
const { wrDebMdl, delDebMdl, delModule } = require('@tool/module/timeout')

// Запись данных для TCP/IP модуля
function writeTCP(host, port, opt) {
	return new Promise((resolve, reject) => {
		const socket = new net.Socket()
		const client = new modbus.client.TCP(socket, opt?.slave)
		const optTCP = {
			host,
			port,
		}
		socket.on('error', (e) => {
			socket.end()
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('connect', (_) => {
			const { i, v } = regist(opt)

			// Метод записи single | multiple
			let type = 'writeMultipleRegisters'
			if (toSingle.includes(opt?.name)) {
				type = 'writeSingleRegister'
				v = v[0]
			}

			// Запись
			client[type](i, v)
				.then((r) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve(true)
				})
				.catch((e) => {
					console.error(9900, 'Ошибка запись', opt.name, opt.ip, e.message)
					wrDebMdl(opt._id)
					resolve({ error: e, info: opt })
				})
				.finally((_) => {
					socket.end()
				})
		})
		socket.connect(optTCP)
	})
}

module.exports = writeTCP
