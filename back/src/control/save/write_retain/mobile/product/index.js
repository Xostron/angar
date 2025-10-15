
/**
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const { buildingId,  value } = obj
	data[buildingId] ??= {}
	data[buildingId].product = value
	return data
}
/* 
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "productId":"65d4b0a2ee05ba3bf4289c06", "value":"Лук"}
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "productId":"65fa9dbb73cd8d23f0d07faa", "value":"Картофель"}
*/

module.exports = cb
