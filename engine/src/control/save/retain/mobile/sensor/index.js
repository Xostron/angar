/**
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { pcId, buildingId, obj } = acc
	for (const idSens in obj) {
		result[buildingId][idSens] ??= {}
		result[buildingId][idSens] = { ...result[buildingId][idSens], ...obj[idSens] }
	}
}

/* 
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
