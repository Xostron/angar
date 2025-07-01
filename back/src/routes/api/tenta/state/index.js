// const preparing = require('@root/client/state/fn')
const reconciliation = require('@tool/state')
const { data: store, dataDir } = require('@store')

function state() {
	return async function (req, res) {
		const type = req.query?.type
		const { result, present } = await reconciliation(type)
		console.log(999002, 'Запрос state от Admin, отправлено:', result.length, 'из', Object.keys(present).length, 'ключей')
		res.status(200).json(result ?? [])
	}
}

module.exports = state
