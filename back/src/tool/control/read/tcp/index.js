const modbus = require('jsmodbus')
const net = require('net')
const { rhr } = require('../fn')
const { wrDebMdl, delDebMdl, delModule } = require('@tool/message/plc_module')

function readTCP(host, port, opt) {
	return new Promise((resolve, reject) => {
		if (!host) {
			wrDebMdl(opt._id)
			return resolve({ error: 'Не указан IP модуля', info: opt })
		}
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
					p.push(rhr(cl, opt.wr, 'valuesAsArray', 'OUTPUT'))
					break
				case 'rw':
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt, 'INPUT'))
					p.push(rhr(cl, opt.wr, 'valuesAsArray', opt, 'OUTPUT'))
					break
				default:
			}
			Promise.all(p)
				.then(([r, w]) => {
					convAO(opt, r)
					r = convUint32DO(opt, r)
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					if (opt.use === 'w') {
						console.log('Чтение DO', opt.name, opt.ip)
						console.table(r)
					}
					resolve([r, w])
				})
				.catch((e) => {
					console.log('Ошибка чтения DO', opt.name, opt.ip)
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
// Нормализация данных с аналогового модуля:
// читаемые данные с модуля: [200, 1000, ...] нормализируются -> [20, 100, ...]
function convAO(opt, arr) {
	if (!opt.name.includes('AO')) return
	arr.forEach((el, i) => (arr[i] = el / opt.wr.on))
}

// Нормализация данных с модуля DO 24выхода (например, МУ210-412_DO)
// реверс слов 16бит
function convUint32DO(opt, arr) {
	if (opt?.wr?.channel !== 24) return arr
	const word1 = arr.slice(0, 16)
	const word2 = arr.slice(16, 32)
	const r = [...word2, ...word1]
	return r
}

module.exports = readTCP
