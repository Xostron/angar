/**
 *
 * @param {*} acc данные от web клиента {_id:buildId, value: true/false}
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { _id, val, name } = acc
	result[_id].start = val
}

module.exports = cb
