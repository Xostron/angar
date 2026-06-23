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
		// if (host === '192.168.21.135') console.log(13, host, port, opt)
		// if (host === '192.168.21.125') console.log(13, host, port, opt)
		socket.on('error', (e) => {
			socket.end()
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('connect', (_) => {
			const { i, v } = regist(opt)
			cl.writeMultipleRegisters(i, v)
				.then((_) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					// if (host === '192.168.21.135') console.log(14, opt.name, i, v)
					// if (host === '192.168.21.125') console.log(14, opt.name, i, v)
					// if (opt.ip === '192.168.21.126')
					// console.log(666, 'write', opt.ip, opt.value)
					// console.log(9900, 'Запись', opt.name, opt.ip)
					// console.table(opt.value)
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
