const axios = require('axios')

const api = axios.create({
	// Axios Interceptors
	// авто добавление кук
	withCredentials: true,
	// Базовый url
	baseURL: process.env.PUBLIC_LOCAL_API || process.env.PUBLIC_API,
	// timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
})


export default api
