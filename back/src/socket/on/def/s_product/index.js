
/**
 *
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	let result = data ? data : {}
	if (obj.buildingId) result[obj.buildingId].product = { _id: obj._id, name: obj.name , code: obj.code}
	return result
}
module.exports = cb