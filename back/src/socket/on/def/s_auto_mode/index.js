
/**
 *
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	let result = data ? data : {}
	result = { ...result, [obj._id]: { ...result[obj._id], automode: obj.val } }
	return result
}

module.exports = cb
