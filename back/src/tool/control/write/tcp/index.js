const modbus = require('jsmodbus')
const net = require('net')
const { regist } = require('./fn')
const { wrDebMdl, delDebMdl, delModule } = require('@tool/message/plc_module')
// Модули записываемые по sigleRegister
const toSingle = ['FC VFD1 DO', 'FC VFD1 AO']

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
			let { i, v } = regist(opt)
			// DO
			// if (opt?.wr?.start == 8192) v = [5]
			// AO
			// if (opt?.wr?.start == 4096) v = [2500]

			if (opt?.name == 'FC VFD1 DO' || opt?.name == 'FC VFD1 AO')
				console.log(66, 'write = ', i, v)

			// Метод записи single | multiple
			const action = toSingle.includes(opt?.name) ? single : multiple
			// Запись
			action(cl, socket, opt, i, v).then(resolve).catch(resolve)
		})
		socket.connect(optTCP)
	})
}

module.exports = writeTCP

// v - массив значений
function multiple(cl, socket, opt, i, v) {
	return new Promise((resolve, reject) => {
		cl.writeMultipleRegisters(i, v)
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
}

// v - значение
function single(cl, socket, opt, i, v) {
	return new Promise((resolve, reject) => {
		cl.writeSingleRegister(i, v[0])
			.then((r) => {
				// if (opt?.wr?.start == 8192) console.log(77, r)
				// else console.log(99, r)
				// if (opt?.wr?.start == 4096) console.log(88, r)
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
}
