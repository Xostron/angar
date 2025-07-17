function reboot() {
	return function (req, res, next) {
		res.json({ result: 'reboot ok' })
	}
}

module.exports = reboot
