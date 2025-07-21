import api from '../config'

async function authLogin(data) {
	const config = {
		method: 'POST',
		url: `web/auth/login`,
		maxBodyLength: Infinity,
		data,
	}
	return api(config)
		.then((r) => {
			console.log(`Response auth/login`, r.data)
			return r.data
		})
		.catch((error) => {
			console.log(`Error service_angar/${code}`, error)
			return { error }
		})
}

export { authLogin }
