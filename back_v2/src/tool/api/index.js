const axios = require('axios');

const api = axios.create({
	// Axios Interceptors
	// авто добавление кук
	withCredentials: true,
	// Базовый url
	baseURL: process.env.API_URI,
	timeout: 10000,
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
	}
);

module.exports = api;
