const modbus = require('jsmodbus')
const net = require('net')
const { regist } = require('./fn')
const { wrDebMdl, delDebMdl, delModule } = require('@tool/message/plc_module')

// Запись данных для TCP/IP модуля
function writeTCP(host, port, opt) {
	return new Promise((resolve, reject) => {
		const socket = new net.Socket()
		const cl = new modbus.client.TCP(socket, opt?.slave)
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
			// if (host==='192.168.21.131') console.log(777, i, v)
			cl.writeMultipleRegisters(i, v)
				.then((_) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve(true)
				})
				.catch((e) => {
					console.error(9900, 'Ошибка запись', opt.name, opt.ip, e)
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
