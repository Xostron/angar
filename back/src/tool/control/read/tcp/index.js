const modbus = require('jsmodbus')
const net = require('net')
const { rhr } = require('../fn')
const { wrDebMdl, delDebMdl, delModule } = require('@tool/message/plc_module')

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
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('connect', (_) => {
			const p = []
			switch (opt.use) {
				case 'r':
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt, 'INPUT'))
					break
				case 'w':
					p.push(rhr(cl, opt.wr, 'valuesAsArray','OUTPUT'))
					break
				case 'rw':
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt,'INPUT'))
					p.push(rhr(cl, opt.wr, 'valuesAsArray', opt,'OUTPUT'))
					break
				default:
			}
			Promise.all(p)
				.then(([r, w]) => {
					convAO(opt, r)
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve([r, w])
				})
				.catch((e) => {
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

function convAO(opt, arr) {
	if (!opt.name.includes('AO')) return
	arr.forEach((el, i) => (arr[i] = el / opt.wr.on))
}

module.exports = readTCP
