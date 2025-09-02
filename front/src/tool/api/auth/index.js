import api from '../config';

function authLogin(data) {
	return new Promise((resolve, reject) => {
		const config = {
			method: 'POST',
			url: `web/auth/login`,
			maxBodyLength: Infinity,
			data,
		}
		return api(config)
			.then((r) => {
				console.log(`Response auth/login`, r.data)
				resolve(r.data)
			})
			.catch((error) => {
				console.log(`Error service_angar/`, error)
				reject(error)
			})
	})
}

export { authLogin }
