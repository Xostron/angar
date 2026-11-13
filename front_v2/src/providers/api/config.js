const axios = require('axios');
const uri = require('@store/uri');

const api = axios.create({
	// Axios Interceptors
	// авто добавление кук
	withCredentials: true,
	// Базовый url
	baseURL: 'http://'+uri.api,
	// timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		Pragma: 'no-cache',
		Expires: '0',
	},
});

export default api;
