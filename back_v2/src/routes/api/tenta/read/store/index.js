const transform = require('./transform')

function getStore() {
	return async function (req, res) {
		try {
			// Получение параметров из запроса
			const { bldId, secId } = req.params
			if (!bldId) {
				return res.status(400).json({
					error: 'Не указаны обязательные параметры buildingId',
				})
			}
			let result = await transform(bldId, secId)
			// Превращаем в одноуровневый для Виктора
			result = { ...result, ...result.value }
			delete result.value
			delete result.valve
			res.json({ result })
		} catch (error) {
			console.log('getStore error', error)
			res.status(400).json({ error: error.toString() })
		}
	}
}

module.exports = getStore
