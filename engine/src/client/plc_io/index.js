const api = require('@tool/api_plc_io')
const { data: store, live } = require('@store')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'engine/output',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

async function outputIO(out) {
	try {
		if (!out) return console.log('Данные о выходах не сформированы на PLC_IO')

		const o = checkChange(out)
		console.log(11, 'На запись', o)
		if (!o) return console.log('Данные о выходах не изменялись, не отправляем на PLC_IO')

		const r = await api(apiConfig(o))
		// Запрос не успешен
		if (!r.data)
			throw new Error('ENGINE->PLC_IO. ❌Не удалось передать данные о выходах на PLC_IO')

		console.log(
			'\x1b[32m%s\x1b[0m',
			'ENGINE->PLC_IO. Данные о выходах успешно отправлены на PLC_IO',
			'Ответ от plc_io',
			JSON.stringify(r.data),
		)

		live()
		// Сохраняем в аккумулятор актуальные значения модулей
		store.v = r.data.v
		return true
	} catch (error) {
		console.error(error)
	}
}

module.exports = outputIO

/**
 * Проверка на изменения
 *
 * @param {*} out
 * @returns {boolean} true - Изменения есть, оптравка на запись на PLC_IO
 * false - изменений нет, блокируем отправку на PLC_IO
 */
function checkChange(out) {
	const o = out.filter((el) => {
		if (
			JSON.stringify(el.value) !==
			JSON.stringify(store.v[el._id[0]]?.output ?? store.v[el._id[0]])
		) {
			return true
		}
	})
	return o.length ? o : false
}
