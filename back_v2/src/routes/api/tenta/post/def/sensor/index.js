
/**
 * @param {*} o данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(o, data) {
	const { buildingId, obj } = o
	data[buildingId] ??= {}
	for (const sensorId in obj) {
		data[buildingId][sensorId] = { ...data[buildingId][sensorId], ...obj[sensorId] }
	}

	return data
}

/* 
obj = {"65d4aed4b47bb93c40100fd5": {
    "65d4af00b47bb93c40100fd7": {  "corr": 0 },
    "65d4af0cb47bb93c40100fd8": { "on": false, "corr": 1 },
    "65d4af64b47bb93c40100fd9": {  },
    "65d4af7db47bb93c40100fda": { "on": false, "corr": 0 },
    "65d4af9cb47bb93c40100fdb": { "on": true, "corr": 1 }
  }}

obj={
"buildingId":"65d4aed4b47bb93c40100fd5",
"obj": {
    "65d4afe5b47bb93c40100fde": { "on": true, "corr": 1 },
    "65d4aff0b47bb93c40100fdf": { "on": false, "corr": 1 },
    "65d4afc8b47bb93c40100fdc": { "on": true, "corr": 1 },
    "65d4afd4b47bb93c40100fdd": { "on": false, "corr": 1 }
}}
*/

module.exports = cb
