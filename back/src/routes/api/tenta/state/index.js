// const preparing = require('@root/client/state/fn')
const reconciliation = require('@tool/state')
const { data: store, dataDir } = require('@store')

function state() {
	return async function (req, res) {
		const { result, present } = await reconciliation()

		console.log(999002, 'Запрос state, present (собранные)', Object.keys(present).length, 'Отправлено на сервер:', result.length)
		res.status(200).json(result ?? [])
	}
}

module.exports = state
