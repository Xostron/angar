const fnList = require('./fn')

/**
 * Данные для страницы Датчики
 * @returns 
 */
function signal() {
	return async function (req, res) {
		try {
			// Получение параметров из запроса
			const { bldId, secId } = req.params
			// console.log(1111, store.value)
			if (!bldId || !secId) {
				return res.status(400).json({ error: 'Не указаны обязательные параметры' })
			}
			
			const result = await fnList(req.params)
			res.json({ result })
		} catch (error) {
			res.status(400).json({ error: error.toString() })
		}
	}
}









module.exports = signal
