/**
 * Авторежим
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const {pcId, buildingId, value} = acc
	result[buildingId].automode = value
}

module.exports = cb
