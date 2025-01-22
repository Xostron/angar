const { data: store } = require('@store')
function monitoring() {
	return function (req, res) {
		// Получение параметров из запроса
		const { bldId } = req.params
		if (!bldId) {
			return res.status(400).json({ error: 'Не указаны обязательные параметры' })
		}
		const s = store?.value?.alarm?.signal[bldId]
		// console.log(s)
		if (!s) {
			return res.status(404).json({ error: 'Здание не найдено: ' + bldId })
		}
		const result = s?.map((el) => ({
			date: el.date,
			msg: `${el.title ?? ''} ${el.msg ?? ''}`,
			type: el.typeSignal,
		}))

		if (!result) {
			return res.status(404).json({
				error: 'Сигналы не найдены: ' + bldId,
			})
		}
		res.json({ result })
	}
}

module.exports = monitoring
