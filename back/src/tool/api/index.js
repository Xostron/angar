const axios = require('axios')

const api = axios.create({
	// Axios Interceptors
	// авто добавление кук
	withCredentials: true,
	// Базовый url
	baseURL: process.env.API_URI || 'http://localhost:3200/api/',
	// timeout: 10000,
})

// Перехват 401 ошибки Не авторизованный пользователь
api.interceptors.response.use(
	(response) => {
		return response
	},
	async (error) => {
		// Обрабатываем ошибку
		const original = error.config
		if (!error.response) {
			return error
		}
		const st = error.response.status
		// Обработка статусов
		return error
	}
)

module.exports = api
