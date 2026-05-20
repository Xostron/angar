const { data: store } = require('@store')

function setting() {
	return function (req, res) {
		// Получение параметров из запроса
		const { bldId, codeS, codeP } = req.params
		if (!bldId || !codeS || !codeP) return res.status(400).json({ error: 'Не указаны обязательные параметры' })
		const retain = store.value?.retain?.[bldId]
		if (!retain) return res.status(404).json({ error: 'Склад не найден: ' + bldId })
		// Мясо - Настройки
		let data = retain.setting?.[codeS]?.[codeP] ?? retain.setting?.[codeS] ?? {}
		const fct = store.value?.factory?.[codeS]?.[codeP] ??  store.value?.factory?.[codeS]
		// Дополнение пустых полей заводскими значениями
		data = {...fct, ...data}
		res.json({ result: data })
	}
}

module.exports = setting
