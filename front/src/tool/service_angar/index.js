import api from './config'

async function get(code) {
	const config = {
		method: 'GET',
		maxBodyLength: Infinity,
		url: `web/service/${code}`,
		// url:`/test/${code}`,
		headers: { 'Content-Type': 'application/json' },
	}
	return api(config)
		.then((r) => {
			console.log(`Response service_angar/${code}`, r.data)
			return r.data.result
		})
		.catch((error) => {
			console.log(`Error service_angar/${code}`, error)
			return {  error }
		})
}

async function post(code, data) {
	const config = {
		method: 'POST',
		maxBodyLength: Infinity,
		url: `web/service/${code}`,
		headers: { 'Content-Type': 'application/json' },
		data,
	}
	return api(config)
		.then((r) => {
			console.log(`Response service_angar/${code}`, r.data)
			return r.data.result
		})
		.catch((error) => console.log(`Error service_angar/${code}`, error))
}

export { get, post }
