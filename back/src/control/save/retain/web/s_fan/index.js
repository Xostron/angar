/**
 * Ввод/вывод из работы ВНО
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { buildingId, sectionId, fanId, value, name } = acc
	// Массовый вывод из работы ВНО (испарители)
	if (acc?._ids) {
		acc._ids.forEach((_id) => {
			result[buildingId].fan ??= {}
			result[buildingId].fan[sectionId] ??= {}
			result[buildingId].fan[sectionId][_id] = value
		})
		return
	}
	result[buildingId].fan ??= {}
	result[buildingId].fan[sectionId] ??= {}
	result[buildingId].fan[sectionId][fanId] = value
}
module.exports = cb
