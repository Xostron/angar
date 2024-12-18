const def = require('./def')

function write() {
	return function (req, res) {
		const code = req.params.code
		const obj = req.body

		if (!def[code]) return res.status(400).json(`Операция отклонена. Неизвестный код ${code}`)

		def[code](obj)
			.then((_) => res.json('ok'))
			.catch((error) => {
				console.log('error', error)
				res.status(400).json({ error })
			})
	}
}

module.exports = write
