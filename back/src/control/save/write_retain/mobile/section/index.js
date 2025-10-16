/**
 * @param {*} acc данные от клиента
 * @param {*} data данные из файла data/retain/data.json
 */
function cb(acc, result) {
	const { pcId, buildingId, sectionId, value } = acc
	result[buildingId].mode ??= {}
	result[buildingId].mode[sectionId] = value
}


module.exports = cb
