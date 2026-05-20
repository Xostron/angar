const axios = require('axios');

const api = axios.create({
	// Axios Interceptors
	// авто добавление кук
	withCredentials: true,
	// Базовый url
	baseURL: process.env.API_URI,
	timeout: 10000,
});

// Добавляем интерцептор, который сработает перед каждым запросом
axios.interceptors.request.use((config) => {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const offset = new Date().getTimezoneOffset();
	console.log('timezone', timezone);
	console.log('offset', offset);

	// Добавляем кастомные заголовки
	config.headers['X-Client-Timezone'] = timezone;
	config.headers['X-Client-Timezone-Offset'] = offset;

	return config;
});
// Перехват 401 ошибки Не авторизованный пользователь
api.interceptors.response.use(
	(response) => {
		// console.log('\n\napi.interceptors.response.use', response);
		return response;
	},
	async (error) => {
		// console.log('\n\napi.interceptors.response.use error', error);
		// Обрабатываем ошибку
		const original = error.config;
		if (!error.response) {
			return error;
		}
		const st = error.response.status;
		// Обработка статусов
		return error;
	},
);

module.exports = api;
