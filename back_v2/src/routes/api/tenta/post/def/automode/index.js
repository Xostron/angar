/**
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	data[obj.buildingId] ??= {}
	data[obj.buildingId].automode = obj.value
	return data
}
/* 
obj = { "buildingId": "65d4aed4b47bb93c40100fd5", "value": "drying" }
*/

module.exports = cb
