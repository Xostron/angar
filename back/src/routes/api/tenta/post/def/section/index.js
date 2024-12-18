
/**
 * @param {*} obj данные от клиента
 * @param {*} data данные из файла data/retain/data.json
 */
function cb(obj, data) {
	data[obj.buildingId] ??= {}
	data[obj.buildingId].mode ??= {}
	data[obj.buildingId].mode[obj.sectionId] = obj.value
	return data
}
/* 
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "sectionId":"65fbc84a45a71f17c430b8ad", "value":false}
*/

module.exports = cb
