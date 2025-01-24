const modbus = require('jsmodbus')
const { SerialPort } = require('serialport')
const { rhr } = require('../fn')
const { data: store, wrModule, delModule, wrDebMdl, delDebMdl } = require('@store')
// const { msgM } = require('@tool/message')

// Чтение данных RTU модуля
function readRTU(path, position, opt) {
	const optRTU = {
		baudRate: 9600,
		stopBits: 1,
		dataBits: 8,
		parity: 'none',
	}

	return new Promise((resolve, reject) => {
		const socket = new SerialPort({
			path,
			...optRTU,
		})
		const cl = new modbus.client.RTU(socket, position)

		socket.on('error', (e) => {
			socket.end()
			// При первом запуске неисправные модули не блокируются
			// if (!store.startup)
			// 	wrModule(opt.buildingId, opt._id, { date: new Date(), ...msgM(opt.buildingId, opt, 110) })
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('open', (_) => {
			const p = []
			switch (opt.use) {
				case 'r':
					p.push(rhr(cl, opt.re, '_values', opt))
					break
				case 'w':
					p.push(rhr(cl, opt.wr, '_values'))
					break
				case 'rw':
					p.push(rhr(cl, opt.re, '_values'))
					p.push(rhr(cl, opt.wr, '_values'))
					break
				default:
			}
			Promise.all(p)
				.then((r) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve(r)
				})
				.catch((e) => {
					// wrModule(opt.buildingId, opt._id, { date: new Date(), ...msgM(opt.buildingId, opt, 110) })
					wrDebMdl(opt._id)
					resolve({ error: e, info: opt })
				})
				.finally((_) => {
					socket.close()
				})
		})
	})
}

module.exports = readRTU
