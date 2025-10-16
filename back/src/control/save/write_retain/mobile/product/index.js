/**
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { buildingId, productId, value } = acc
	result[buildingId].product = { _id: value._id, code: value.code }
}

module.exports = cb
