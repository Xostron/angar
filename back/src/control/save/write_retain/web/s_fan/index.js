
/**
 *
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const { buildingId, sectionId, fanId, value } = obj
	data[buildingId] ??= {}
	data[buildingId].fan ??= {}
	data[buildingId].fan[sectionId] ??= {}
	data[buildingId].fan[sectionId][fanId] = value

	return data
}
module.exports = cb