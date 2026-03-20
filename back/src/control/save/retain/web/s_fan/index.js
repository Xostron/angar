/**
 * Ввод/вывод из работы ВНО
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { buildingId, sectionId, fanId, value, name } = acc
	result[buildingId].fan ??= {}
	result[buildingId].fan[sectionId] ??= {}
	result[buildingId].fan[sectionId][fanId] = value
}
module.exports = cb
