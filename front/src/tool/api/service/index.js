import api from '../config';

function get(code) {
	return new Promise((resolve, reject) => {
		const config = {
			method: 'GET',
			maxBodyLength: Infinity,
			url: `web/service/${code}`,
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000,
		};
		api(config)
			.then((r) => {
				console.log(`Response service_angar/${code}`, r.data);
				resolve(r.data);
			})
			.catch((error) => {
				console.log(`Error service_angar/${code}`, error);
				reject({ error });
			});
	});
}

function post(code, data) {
	return new Promise((resolve, reject) => {
		const config = {
			method: 'POST',
			maxBodyLength: Infinity,
			url: `web/service/${code}`,
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
				console.log(`Error service_angar/${code}`, error);
				reject({ error });
			});
	});
}

export { get, post };
