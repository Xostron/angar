const os = require('os')

function mac() {
	return function (req, res, next) {
		let net = os.networkInterfaces()
		net = Object.values(net).flat()
		const mac = net.find((el) => el.address == process.env.IP)
		console.log(5555, mac, process.env.IP)
		res.json({ result: { ip: process.env.IP, mac } })
	}
}

module.exports = mac
