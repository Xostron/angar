const {data:store} = require('@store')
/**
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const { buildingId, code, product, value } = obj
	data[buildingId] ??= {}
	data[buildingId].setting ??= {}
	data[buildingId].setting[code] ??= {}
	// console.log(1111, obj)
	// Данная настройка относится к настройкам без продукта ?
	const isWithout = store.stgWithout.includes(code)
	// С продуктом
	if (!isWithout) {
		data[buildingId].setting[code][product] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != "object" || val == null)
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
		if (typeof val != "object" || val == null)
			data[buildingId].setting[code][fld] = val
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
