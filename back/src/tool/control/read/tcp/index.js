const modbus = require('jsmodbus')
const net = require('net')
const { rhr } = require('../fn')
const { data: store, wrModule, delModule, wrDebMdl, delDebMdl } = require('@store')
// const { msgM } = require('@tool/message')

function readTCP(host, port, opt) {
	return new Promise((resolve, reject) => {
		const socket = new net.Socket()
		const cl = new modbus.client.TCP(socket)
		const optTCP = {
			host,
			port,
		}
		socket.on('error', (e) => {
			socket.end()
			// При первом запуске неисправные модули не блокируются
			// if (!store.startup) wrModule(opt.buildingId, opt._id, { date: new Date(), ...msgM(opt.buildingId, opt, 110) })
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('connect', (_) => {
			const p = []
			switch (opt.use) {
				case 'r':
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt))
					break
				case 'w':
					p.push(rhr(cl, opt.wr, 'valuesAsArray'))
					break
				case 'rw':
					p.push(rhr(cl, opt.re, 'valuesAsArray'))
					p.push(rhr(cl, opt.wr, 'valuesAsArray'))
					break
				default:
			}
			Promise.all(p)
				.then(([r, w]) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve([r, w])
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

module.exports = readTCP
