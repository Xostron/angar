/**
 * Сохранение настроек от web angar
 * @param {*} obj данные от web клиента
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	const { buildingId, code, prdCode, value } = obj
	data[buildingId] ??= {}
	data[buildingId].setting ??= {}
	data[buildingId].setting[code] ??= {}
	data[buildingId].update ??= {}
	data[buildingId].update.setting ??= {}

	if (prdCode) {
		data[buildingId].update.setting[code] ??= {}
		data[buildingId].update.setting[code][product] = new Date()
		data[buildingId].setting[code][prdCode] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null)
				data[buildingId].setting[code][prdCode][fld] = val
			else
				data[buildingId].setting[code][prdCode][fld] = {
					...data[buildingId].setting[code][prdCode][fld],
					...val,
				}
		}
	} else {
		data[buildingId].update.setting[code] = new Date()
		data[buildingId].setting[code] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null) data[buildingId].setting[code][fld] = val
			else
				data[buildingId].setting[code][fld] = {
					...data[buildingId].setting[code][fld],
					...val,
				}
		}
	}
	return data
}
module.exports = cb
