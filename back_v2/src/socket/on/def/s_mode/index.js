
/**
 *
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const result = data ? data : {}
	for (key in obj) {
		for (i in obj[key]) {
			result[key] = { ...result[key], mode: { ...result?.[key]?.['mode'], [i]: obj[key][i] } }
		}
	}
	return result
}
module.exports = cb