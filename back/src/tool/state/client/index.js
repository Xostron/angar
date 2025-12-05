const prepare = require('./prepare');
const api = require('@tool/api');

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
});

/**
 * Собрать данные по складам и отправить на Админ-сервер
 * @returns
 */
module.exports = async function state() {
	try {
		// TODO: Пропуск отправки данных на локальном хосте
		if (['127.0.0.1', 'localhost'].includes(process.env.IP)) {
			console.log(
				'\x1b[32m%s\x1b[0m',
				`IP ${process.env.IP} не является публичным, пропуск отправки данных на Tenta`
			);
			return false;
		}
		// Формирование state (значения данных по PC)
		console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: 1. Подготовка данных...')
		const o = await prepare()
		console.log('\x1b[33m%s\x1b[0m', 'POS->Tenta: 1. ✅Подготовка пройдена')
		// Если данные не готовы -> пропуск итерации
		if (!o) {
			console.log(
				'\x1b[33m%s\x1b[0m',
				'POS->Tenta: 2. ✅Данные не готовы. Операция закончена'
			);
			return false;
		}

		// Если изменений не было
		if (!o.result.length) {
			const now = new Date() - (o?.hub?.last ?? new Date());
			// Если нет изменений и 10 мин не прошло, не отправляем запрос
			if (o?.hub?.last && now < 10 * 60 * 1000) {
				console.log(
					'\x1b[33m%s\x1b[0m',
					'POS->Tenta: 2. ✅Данные не изменялись, не передаем на сервере. Операция закончена'
				);
				return false;
			}
			console.log(
				'\x1b[33m%s\x1b[0m',
				'POS->Tenta: 2. ✅Прошло 10 минут с последнего обновления...'
			);
		}
		// Передать данные INIT или delta
		console.log(
			'\x1b[33m%s\x1b[0m',
			'POS->Tenta: 2. Соединение с Tenta...',
			process.env.API_URI
		);
		const params = o?.hub?.init ? null : { type: 'init' };
		const config = apiConfig(o.result, params);
		const response = await api(config);
		if (!response.data) {
			throw new Error(
				'POS->Tenta: 3. ❌Не удалось передать данные на Tenta'
			);
		}
		// Передача POS->Tenta успешна, обновляем прошлые значения
		o.hub.init = new Date();
		o.hub.last = new Date();
		o.hub.state =
			o.diffing === null ? o.present : { ...o.hub.state, ...o.diffing };
		console.log(
			'\x1b[33m%s\x1b[0m',
			'3. ✅POS->Tenta: Данные переданы',
			o?.result?.length
		);
		// console.log(4, o.result)
		return true;
	} catch (error) {
		throw error;
	}
};
