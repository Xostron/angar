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

// Получение данных от ЦС
async function loopState() {
	while (true) {
		try {
			await state()
			// отправка состояния каждые 10 секунд
			await delay(process.env?.PERIOD_STATE ?? 10000)
		} catch (error) {
			console.log(660001, error.message)
			return
		}
	}
}

async function state() {
	try {
		// Формирование state (значения данных по PC)
		const o = await preparing()
		// Если данные не готовы, пропуск итерации
		if (!o) return false

		// Если изменений не было
		if (!o.result.length) {
			const now = new Date() - (o?.hub?.last ?? new Date())
			// Если нет изменений и 10 мин не прошло, не отправляем запрос
			if (o?.hub?.last && now < 10 * 60 * 1000) {
				console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: Данные не изменялись, не передаем на сервере')
				return false
			}
			console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: Прошло 10 минут с последнего обновления ')
		}
		// Передать данные INIT или delta
		const params = o?.hub?.init ? null : { type: 'init' }
		const config = apiConfig(o.result, params)
		// const response = await axios.request(config)
		const response = await api(config)
		if (!response.data) {
			// o.hub.last = false
			throw new Error('POS->Tenta: Не удалось передать данные ')
		}

		// Передача POS->Tenta успешна, сохраняем результат
		o.hub.init = new Date()
		o.hub.last = new Date()
		o.hub.state = o.present
		console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: Данные переданы', o?.result?.length)
		return true
	} catch (error) {
		throw error
	}
}

module.exports = { loopState, state }
