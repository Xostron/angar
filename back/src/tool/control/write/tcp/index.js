const modbus = require('jsmodbus')
const net = require('net')
const { wrModule, delModule, wrDebMdl, delDebMdl } = require('@store')
const { writeAcc, removeAcc } = require('@tool/acc_json')
const { regist } = require('./fn')

// Запись данных для TCP/IP модуля
function writeTCP(host, port, opt, acc) {
	return new Promise((resolve, reject) => {
		const socket = new net.Socket()
		const cl = new modbus.client.TCP(socket)
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
			cl.writeMultipleRegisters(i, v)
				.then((_) => {
					delModule(opt.buildingId, opt._id)
					removeAcc(acc, { bldId: opt.buildingId, code: opt._id }, 'module')
					delDebMdl(opt._id)
					resolve(true)
				})
				.catch((e) => {
					// wrModule(opt.buildingId, opt._id, { date: new Date(), ...msgM(opt.buildingId, opt, 110) })
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
