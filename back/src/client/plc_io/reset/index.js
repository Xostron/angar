const api = require('@tool/api_plc_io')
const { data: store, live } = require('@store')
const { reset } = require('@tool/reset')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/reset',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

/**
 * Отправка данных на запись модулей + обновление опроса модулей
 * @param {object[]} out Массив модулей (module+equipment+value) на запись
 * @returns
 */
async function resetIO() {
	try {
		// Если нет сигнала сброса, то ничего не отправляем
		if (!store.reset?.size)
			return console.log(
				'\x1b[32m%s\x1b[0m',
				'🟡 back -> plc_io (reset): Нет команды сброса аварии модулей',
			)

		// Запрос back->plc_io (reset)
		const r = await api(apiConfig({}))

		// Ошибка запроса
		if (!r.data) throw new Error('🔴 back -> plc_io (reset): Ошибка запроса')
		reset(null, false, false)
		console.log('\x1b[32m%s\x1b[0m', '🟢 back -> plc_io (reset): Запрос успешно обработан')

		// Обновление опроса модулей
		store.v = r.data.v
		// Обновление списка аварий
		store.alarm.module = r.data.alarm
		// Пинг
		live()
		return true
	} catch (error) {
		console.error(error)
	}
}

module.exports = resetIO
