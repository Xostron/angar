const { data: store } = require('@store')
const { live } = require('@store/index')

// Прием данных от PLC_IO. Значения опроса модулей
function post() {
	return function (req, res) {
		// Сохраняем в аккумулятор данные опроса модулей
		if (Object.keys(req?.body?.v ?? {}).length) store.v = req.body.v
		// Сохраняем в аккумулятор аварии модулей
		store.alarm.module = req?.body?.alarm ?? {}
		// Пинг
		live()
		console.log('🟢 Значения модулей получены')
		res.status(200).json({ result: true })
	}
}

module.exports = post
