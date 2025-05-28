const { preparing, convertTenta, delta } = require('./fn')
const { delay } = require('@tool/command/time')
const api = require('@tool/api')
const axios = require('axios')

const apiConfig = (data) => ({
	method: 'post',
	maxBodyLength: Infinity,
	baseURL: 'http://192.168.21.39:3200/api/',
	url: 'angar/state',
	headers: {
		'Content-Type': 'application/json',
		ip: process.env.IP,
	},
	data,
})

async function loopState() {
	while (true) {
		state()
			.then()
			.catch((error) => {
				console.log(660001, error.message)
			})
		// отправка состояния каждые 5 минут
		await delay(process.env?.PERIOD_STATE ?? 10000)
	}
}

async function state() {
	try {
		// Формирование state (значения данных по PC)
		const o = await preparing()
		if (!o) return
		const { value, hub, pcId } = o

		// Расчет delta (первое включение прошло успешно hub.init = true)
		let valDelta
		if (hub.init) {
			// Предыдущая передача POS->Tenta успешна, сохраняем результат
			valDelta = delta(value, hub.state)
			// console.log(661, 'Расчет delta', valDelta)
		}

		// Формируем данные для Tenta
		const result = convertTenta(valDelta ?? value, pcId)
		// console.log(662, result.length)

		// Передать данные INIT или delta
		const config = apiConfig(result)
		// const response = await api(config)
		const response = await axios.request(config);
		if (!response.data) {
			hub.init = false
			hub.last = false
			throw new Error('Не удалось передать данные POS->Tenta')
		}

		// Передача POS->Tenta успешна, сохраняем результат
		hub.init = true
		hub.last = true
		hub.state = value
		console.log('\x1b[33m%s\x1b[0m', 'Данные POS->Tenta переданы', result.length)
		return true
	} catch (error) {
		throw error
	}
}

module.exports = loopState
