/**
 * Продукт
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { buildingId, _id, code, prdName, name } = acc
	result[buildingId].product = { _id, code, name: prdName }
}
module.exports = cb
