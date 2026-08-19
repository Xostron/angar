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
		const cl = new modbus.client.TCP(socket, opt?.slave)
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
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt))
					break
				case 'w':
					p.push(rhr(cl, opt.wr, 'valuesAsArray', opt))
					break
				case 'rw':
					p.push(rhr(cl, opt.re, 'valuesAsArray', opt))
					p.push(rhr(cl, opt.wr, 'valuesAsArray'))
					break
				default:
			}
			Promise.all(p)
				.then(([r, w]) => {
					if (opt?.name.includes("oni-150")) {
						console.log(44, 'read = ', opt.name, opt?.wr?.start ?? opt?.re?.start, r)
					}
					r = convAO(opt, r)
					r = conv32DO(opt, r)
					r = convOni150(opt, r)
					r = convOni150DI(opt, r)
					if (opt?.name.includes("oni-150")) {
						console.log(55, 'read = ', opt.name, opt?.wr?.start ?? opt?.re?.start, r)
					}
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve([r, w])
				})
				.catch((e) => {
					console.error(8800, 'Ошибка чтения', opt.name, opt.ip, e.message)
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

// Нормализация данных аналоговых модулей:
// читаемые данные с модуля: [200, 1000, ...] нормализируются -> [20, 100, ...]
function convAO(opt, arr) {
	if (!opt.name.includes('AO')) return arr
	return arr.map((el) => el / opt.wr.on)
}

// Нормализация данных с модуля DO 24выхода (например, МУ210-412_DO)
// реверс слов 16бит
function conv32DO(opt, arr) {
	if (opt?.wr?.channel !== 24) return arr
	const word1 = arr.slice(0, 16)
	const word2 = arr.slice(16, 32)
	const r = [...word2, ...word1]
	return r
}

// Нормализация данных для частотника oni-150 - чтение DO
function convOni150(opt, arr) {
	if (opt.name != 'FC oni-150 DO') return arr
	switch (arr[0]) {
		// Стоп
		case 0.3:
			return [0]
		// Запущен: .1 - прямое вращение, .2 - обратное вращение
		case 0.1:
		case 0.2:
			return [1]
	}
}

// Нормализация данных для частотника oni-150 - чтение DШ код ошибок
function convOni150DI(opt, arr) {
	if (opt.name != 'FC oni-150 DIerr') return arr
	return arr.map((el) => +(el * 10).toFixed(0))
}

module.exports = readTCP
