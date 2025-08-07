const { data: store } = require('@store')

/**
 * Слияние объектов
 * @param {*} obj данные от web клиента (obj.value - основные данные)
 * @param {*} data данные из файла json
 * @return {object} Данные retain + данные от клиента
 */
function cb(obj, data) {
	// TODO

	const { buildingId, code, product, value, timestamp = null } = obj

	
	let lastRefresh = data?.[buildingId]?.update?.setting?.[code]?.[product]
	lastRefresh = lastRefresh ? new Date(lastRefresh) : undefined
	const time = timestamp ? new Date(timestamp) : undefined
	if (!lastRefresh || time <= lastRefresh) {
		console.log(
			'================================',
			data?.[buildingId]?.timestamp?.setting?.[code]?.[product]
		)
		return data
	}

	data[buildingId] ??= {}
	data[buildingId].setting ??= {}
	data[buildingId].setting[code] ??= {}
	data[buildingId].timestamp ??= {}
	data[buildingId].timestamp.setting ??= {}
	data[buildingId].timestamp.setting[code] ??= {}
	data[buildingId].timestamp.setting[code][product] = new Date()
	// Данная настройка относится к настройкам без продукта ?
	const isWithout = store.stgWithout.includes(code)
	// С продуктом
	if (!isWithout) {
		data[buildingId].setting[code][product] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null)
				data[buildingId].setting[code][product][fld] = val
			else
				data[buildingId].setting[code][product][fld] = {
					...data[buildingId].setting[code][product][fld],
					...val,
				}
		}

		return data
	}
	// Без продукта
	data[buildingId].setting[code] ??= {}
	for (const fld in value) {
		const val = value[fld]
		if (typeof val != 'object' || val == null) data[buildingId].setting[code][fld] = val
		else
			data[buildingId].setting[code][fld] = {
				...data[buildingId].setting[code][fld],
				...val,
			}
	}

	return data
}

/* 
obj = {
 "buildingId":"65d4aed4b47bb93c40100fd5", "code":"cure", "productId":"65fa9dbb73cd8d23f0d07faa",
 "value": {
   "difference": {
    "min": 1,
    "max": 1,
    "value": 1
   },
   "min": 1,
   "hysteresis": {
    "in": 1,
    "out": 1
   }
  }
}
*/
module.exports = cb
