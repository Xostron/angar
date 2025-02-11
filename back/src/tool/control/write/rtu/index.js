const modbus = require('jsmodbus')
const { SerialPort } = require('serialport')
const { delModule, wrDebMdl, delDebMdl } = require('@store')

// Запись данных для RTU модуля
function writeRTU(path, position, opt) {
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
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('open', (_) => {
			const i = opt.wr.start
			const v = opt.value.map((v) => v * (opt.wr.on ?? 1))
			cl.writeMultipleRegisters(i, v)
				.then((_) => {
					delModule(opt.buildingId, opt._id)
					delDebMdl(opt._id)
					resolve(true)
				})
				.catch((e) => {
					wrDebMdl(opt._id)
					resolve({ error: e, info: opt })
				})
				.finally((_) => {
					socket.close()
				})
		})
	})
}

module.exports = writeRTU
