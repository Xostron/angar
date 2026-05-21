const api = require('@tool/api')
const { store } = require('@store/index')

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

/**
 * Отправка данных опроса модулей на сервер ангара
 * @returns
 */
async function postV() {
	try {
		if (!Object.keys(store.v ?? {}).length)
			return console.log('Данные опроса модулей не готовы')

		const config = apiConfig(store.v, {})
		const r = await api(config)

		// Запрос не успешен
		if (!r.data) {
			throw new Error('PLC_IO->ENGINE. ❌Не удалось передать данные опроса модулей на ангар')
		}
		console.log(
			'\x1b[32m%s\x1b[0m',
			'PLC_IO->ENGINE. Данные c опроса модулей успешно отправлены на ангар',
		)
		store.live()
		return true
	} catch (error) {
		throw error
	}
}

module.exports = postV
