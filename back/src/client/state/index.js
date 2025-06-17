const preparing = require('./fn')
const { delay } = require('@tool/command/time')
const api = require('@tool/api')
// const axios = require('axios')

const apiConfig = (data, params) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	// baseURL: 'http://192.168.21.39:3200/api/',
	url: 'angar/state',
	headers: {
		'Content-Type': 'application/json',
		ip: process.env.IP,
	},
	data,
	params,
})

async function loopState() {
	while (true) {
		try {
			const ok = await state()
			// отправка состояния каждые 10 минут (при первом запуске ожидание 15сек)
			ok ? await delay(process.env?.PERIOD_STATE1 ?? 15000) : await delay(15000)
		} catch (error) {
			console.log(660001, error.message)
			return
		}
	}
}

async function state(type) {
	try {
		// Формирование state (значения данных по PC)
		const o = await preparing()
		if (!o) return false
		if (type == 'force') console.log(999002, o.hub, o.result)
		// Передать данные INIT или delta
		const params = o.hub.init ? null : { type: 'init' }
		const config = apiConfig(o.result, params)
		// const response = await axios.request(config)
		const response = await api(config)
		if (!response.data) {
			o.hub.last = false
			throw new Error('Не удалось передать данные POS->Tenta')
		}

		// Передача POS->Tenta успешна, сохраняем результат
		o.hub.init = true
		o.hub.last = true
		o.hub.state = o.value
		console.log('\x1b[33m%s\x1b[0m', 'Данные POS->Tenta переданы', o.result.length)
		return true
	} catch (error) {
		throw error
	}
}

module.exports = { loopState, state }
