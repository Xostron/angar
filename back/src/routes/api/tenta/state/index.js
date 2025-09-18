const reconciliation = require('@tool/state/back')

/**
 * Админ-сервер периодически опрашивает сервер ангара (для актуальности)
 * Подготовка state для Админ-сервера
 * @returns
 */
function state() {
	return async function (req, res) {
		console.log(999009)
		try {
			const type = req.query?.type
			const { result = [], present = [] } = await reconciliation(type)
			const pLength = Object.keys(present).length
			console.log(`Запрос state от Admin, отправлено: ${result.length} из ${pLength} ключей`)
			res.status(200).json(result)
		} catch (error) {
			console.log(error)
			res.status(500).json({ error: error.toString() })
		}
	}
}

module.exports = state
