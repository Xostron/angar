const { delay } = require('@tool/command/time');
const api = require('@tool/api');
const getInfo = require('@tool/init/info');
const period = 2 * 60 * 60 * 1000;

/**
 * Период 2 часа: отправка данных на Админ-сервер информации о версии ПО, IP
 * состояния батареи
 * @returns
 */
module.exports = async function info() {
	while (true) {
		try {
			await sendInfo();
			// отправка состояния каждые 10 секунд
			await delay(period);
		} catch (error) {
			console.error('\x1b[33m%s\x1b[0m', error.message);
			await delay(period);
		}
	}
};

async function sendInfo() {
	if (['127.0.0.1', 'localhost'].includes(process.env.IP)) return;
	try {
		const obj = await getInfo();
		console.log(JSON.stringify(obj, null, 2));
		const config = {
			method: 'POST',
			url: process.env.API_URI + 'angar/info',
			headers: { ip: process.env.IP },
			data: obj,
		};
		await api(config);
	} catch (error) {
		console.error('\x1b[33m%s\x1b[0m', error.message);
	}
}
