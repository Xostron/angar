import api from '../config';

// Функция для обработки и форматирования ошибок API
function formatApiError(error, endpoint) {
	const timestamp = new Date().toISOString();
	const errorId =
		Date.now().toString(36) + Math.random().toString(36).substr(2);

	let formattedError = {
		id: errorId,
		timestamp,
		endpoint,
		message: 'Неизвестная ошибка',
		type: 'UNKNOWN_ERROR',
		status: null,
		originalError: error,
	};

	if (error.response) {
		// Сервер ответил с кодом ошибки
		formattedError = {
			...formattedError,
			type: 'SERVER_ERROR',
			status: error.response.status,
			message:
				error.response.data?.message ||
				`Ошибка сервера (${error.response.status})`,
			data: error.response.data,
		};

		switch (error.response.status) {
			case 400:
				formattedError.message = 'Неверный запрос к серверу';
				break;
			case 401:
				formattedError.message = 'Необходима авторизация';
				break;
			case 403:
				formattedError.message = 'Доступ запрещен';
				break;
			case 404:
				formattedError.message = 'Ресурс не найден';
				break;
			case 500:
				formattedError.message = 'Внутренняя ошибка сервера';
				break;
			case 502:
				formattedError.message = 'Сервер временно недоступен';
				break;
			case 503:
				formattedError.message = 'Сервис временно недоступен';
				break;
		}
	} else if (error.request) {
		// Запрос был отправлен, но ответ не получен
		formattedError = {
			...formattedError,
			type: 'NETWORK_ERROR',
			message: 'Ошибка сети или сервер недоступен',
		};
	} else if (error.code === 'ECONNABORTED') {
		// Таймаут запроса
		formattedError = {
			...formattedError,
			type: 'TIMEOUT_ERROR',
			message: 'Превышено время ожидания ответа от сервера',
		};
	} else {
		// Ошибка настройки запроса
		formattedError = {
			...formattedError,
			type: 'REQUEST_ERROR',
			message: error.message || 'Ошибка при формировании запроса',
		};
	}

	console.error(`API Error [${errorId}] ${endpoint}:`, formattedError);
	return formattedError;
}

function get(code, ip = '127.0.0.1') {
	return new Promise((resolve, reject) => {
		const endpoint = `web/service/${code}`;
		const config = {
			method: 'GET',
			maxBodyLength: Infinity,
			url: endpoint,
			baseURL: 'http://' + ip + ':4000/api/',
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		};

		api(config)
			.then((r) => {
				console.log(`Response service_angar/${code}`, r.data);
				resolve(r.data);
			})
			.catch((error) => {
				const formattedError = formatApiError(error, endpoint);
				reject(formattedError);
			});
	});
}

function post(code, data, ip = '127.0.0.1') {
	return new Promise((resolve, reject) => {
		const endpoint = `web/service/${code}`;
		const config = {
			method: 'POST',
			maxBodyLength: Infinity,
			url: endpoint,
			baseURL: 'http://' + ip + ':4000/api/',
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
			data,
		};

		api(config)
			.then((r) => {
				console.log(`Response service_angar/${code}`, r.data);
				resolve(r.data);
			})
			.catch((error) => {
				const formattedError = formatApiError(error, endpoint);
				reject(formattedError);
			});
	});
}

export { get, post };
