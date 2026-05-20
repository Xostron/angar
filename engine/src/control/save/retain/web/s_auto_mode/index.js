/**
 * Авторежим склада
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { _id, val, name } = acc
	if (!_id) return
	if (!val) return
	result[_id].automode = val
}

module.exports = cb
