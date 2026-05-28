const api = require('@tool/api_plc_io')
const { data: store, live } = require('@store')

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
async function ResetIO(reset) {
	try {
		// Если нет сигнала сброса, то ничего не отправляем
		if (!reset) return console.log('back->plc_io (reset)', 'Нет команды сброса аварии модулей')

		// Запрос back->plc_io (reset)
		const r = await api(apiConfig(reset))

		// Ошибка запроса
		if (!r.data) throw new Error('❌back->plc_io (reset): Ошибка запроса')

		console.log('\x1b[32m%s\x1b[0m', 'back->plc_io (reset): Запрос успешно обработан')

		// Флаг PLC_IO на связи
		live()

		// Обновление опроса модулей
		store.v = r.data.v
		// Обновление списка аварий
		store.alarm.module = r.data.alarm
		return true
	} catch (error) {
		console.error(error)
	}
}

module.exports = ResetIO

/**
 * Наличие изменений
 * Сравнение текущего состояния выходов === с состоянием выходов после алгоритма
 *
 * @param {object[]} out массив модулей на запись для PLC_IO
 * @returns {object[] | boolean} 	object[] - массив модулей на запись для PLC_IO (отфильтрованные)
 * 									false - изменений нет, блокируем отправку на PLC_IO
 */
function isChange(out) {
	const o = out.filter((el) => {
		if (
			JSON.stringify(el.value) !==
			JSON.stringify(store.v[el._id[0]]?.output ?? store.v[el._id[0]])
		)
			return true
	})
	return o.length ? o : false
}
