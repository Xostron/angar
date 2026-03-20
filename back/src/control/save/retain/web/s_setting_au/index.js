/**
 * Сохранение настроек от web angar
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { buildingId, code, prdCode, value, name } = acc
	result[buildingId] ??= {}
	result[buildingId].setting ??= {}
	result[buildingId].setting[code] ??= {}
	result[buildingId].update ??= {}
	result[buildingId].update.setting ??= {}

	if (prdCode) {
		result[buildingId].update.setting[code] ??= {}
		result[buildingId].update.setting[code][prdCode] = new Date()
		result[buildingId].setting[code][prdCode] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null)
				result[buildingId].setting[code][prdCode][fld] = val
			else
				result[buildingId].setting[code][prdCode][fld] = {
					...result[buildingId].setting[code][prdCode][fld],
					...val,
				}
		}
	} else {
		result[buildingId].update.setting[code] = new Date()
		result[buildingId].setting[code] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null) result[buildingId].setting[code][fld] = val
			else
				result[buildingId].setting[code][fld] = {
					...result[buildingId].setting[code][fld],
					...val,
				}
		}
	}
}
module.exports = cb
