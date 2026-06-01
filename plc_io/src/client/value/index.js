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
		// Данные не готовы
		if (!Object.keys(store.v ?? {}).length)
			return console.log('🟡 plc_io -> back. Невозможно опросить модули - нет рамы')

		// Запрос
		const config = apiConfig({ v: store.v, alarm: store.alarm.module }, {})
		const r = await api(config)

		// Запрос не успешен
		if (!r.data) {
			throw new Error('🔴 plc_io -> back. Опрос модулей не передан - нет связи с ангаром')
		}

		// Запрос успешен
		console.log('🟢 plc_io -> back. Опрос модулей успешно передан на ангар')
		store.live()
		return true
	} catch (error) {
		console.error(error)
	}
}

module.exports = postV
