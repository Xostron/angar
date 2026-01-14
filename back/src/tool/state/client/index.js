const fnPrepare = require('./prepare')
const api = require('@tool/api')

const apiConfig = (data, params) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'angar/state',
	headers: {
		'Content-Type': 'application/json',
		ip: process.env.IP,
	},
	data,
	params,
})

/**
 * Собрать данные по складам и отправить на Админ-сервер
 * POS -> Tenta
 * если запрос не успешен не фиксировать в аккумуляторе прошлых значений
 * @returns
 */
module.exports = async function state() {
	try {
		// Пропуск отправки данных на локальном хосте
		if (['127.0.0.1', 'localhost'].includes(process.env.IP)) {
			console.log(
				'\x1b[32m%s\x1b[0m',
				`IP ${process.env.IP} не является публичным, пропуск отправки данных на Tenta`
			)
			return false
		}

		// Формирование state (значения данных по PC)
		console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: 1. Подготовка данных...')
		const o = await fnPrepare()
		console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: 1. ✅Подготовка пройдена')

		// Если данные не готовы -> пропуск итерации
		if (!o) {
			console.log(
				'\x1b[33m%s\x1b[0m',
				'POS->Tenta: 2. ✅Данные не готовы. Операция закончена'
			)
			return false
		}

		const { result, hub, present, diffing } = o
		
		// Если изменений не было не отправляем запрос
		if (!result.length) {
			console.log(
				'\x1b[33m%s\x1b[0m',
				'POS->Tenta: 2. ✅Данные не изменялись, не передаем на сервере. Операция закончена'
			)
			return false
		}

		// Передать данные INIT или delta
		console.log(
			'\x1b[33m%s\x1b[0m',
			'POS->Tenta: 2. Соединение с Tenta...',
			process.env.API_URI
		)

		// hub.init = true Первый пул данных был отправлен
		// Первый пул данных (при перезапуске ангара) { type: 'init' }
		// Последующие данные params = null
		const params = hub?.init ? null : { type: 'init' }
		const config = apiConfig(result, params)
		const response = await api(config)

		// Запрос не успешен
		if (!response.data) {
			throw new Error('POS->Tenta: 3. ❌Не удалось передать данные на Tenta')
		}

		// Запрос успешен, обновляем прошлые значения
		// Инициализация пройдена
		hub.init = new Date()
		// Последние данные были успешны переданы
		hub.last = new Date()
		// Обновление прошлых значений: если различий не было (diffing),
		// то сохраняем текущий state (present), иначе прошлые+новые различия
		hub.state = diffing === null ? present : { ...hub.state, ...diffing }
		console.log('\x1b[33m%s\x1b[0m', '3. ✅POS->Tenta: Данные переданы', o?.result?.length)
		// console.log(4, o.result)
		return true
	} catch (error) {
		throw error
	}
}
