const modbus = require('jsmodbus')
const { SerialPort } = require('serialport')
const { wrModule, delModule, wrDebMdl, delDebMdl } = require('@store')
const { writeAcc, removeAcc } = require('@tool/acc_json')
// const { msgM } = require('@tool/message')

// Запись данных для RTU модуля
function writeRTU(path, position, opt, obj) {
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
			// wrModule(opt.buildingId, opt._id, { date: new Date(), ...msgM(opt.buildingId, opt, 110) })
			wrDebMdl(opt._id)
			resolve({ error: e, info: opt })
		})
		socket.on('open', (_) => {
			const i = opt.wr.start
			const v = opt.value.map((v) => v * (opt.wr.on ?? 1))
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
					socket.close()
				})
		})
	})
}

module.exports = writeRTU
