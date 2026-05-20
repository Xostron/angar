const api = require('@tool/api')
const { store } = require('@store')

const apiConfig = (data, params) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'io/value',
	headers: {
		'Content-Type': 'application/json',
		// ip: process.env.IP,
		// 'X-Client-Timezone': timezone,
		// 'X-Client-Timezone-Offset': offset,
	},
	data,
	params,
})

async function post() {
	try {
		if (!Object.keys(store.value ?? {}).length)
			return console.log('Данные опроса модулей не готовы')
		const config = apiConfig(store.value, {})
		const response = await api(config)
		// console.log(response)
		// Запрос не успешен
		if (!response.data) {
			throw new Error('PLC_IO->ENGINE. ❌Не удалось передать данные на ангар')
		}
		console.log('\x1b[32m%s\x1b[0m', 'Данные успешно отправлены на ангар')
		return true
	} catch (error) {
		throw error
	}
}

module.exports = post
