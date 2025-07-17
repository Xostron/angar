import api from '../config'

// Обновить оборудование (конфигурацию PC)

function equipment() {
	const config = {
		method: 'GET',
		maxBodyLength: Infinity,
		url: 'service/equipment',
		headers: { 'Content-Type': 'application/json' },
	}
	// try {
	// 	await api(config)
	// } catch (error) {
	// 	console.log('service_angar/equpment:', error)
	// 	throw error
	// }

	api(config)
		.then((r) => r.json())
		.then((r) => {
			console.log('Response service_angar/equpment:', r)
			return Promise.resolve(r)
		})
		.catch((error) => {
			console.log('Error service_angar/equpment:', error)
			throw error
		})
}

export default equipment
