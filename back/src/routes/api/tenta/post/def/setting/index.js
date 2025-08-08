const { data: store } = require('@store')

/**
 * Обновление данных в настройках retain.json
 * @param {*} obj Данные от web клиента (obj.value - основные данные)
 * @param {*} data Данные из файла json
 * @return {object} Данные retain + данные от клиента
 */
function cb(obj, data) {
	const { buildingId, code, product, value, date = null } = obj
	data[buildingId] ??= {}
	data[buildingId].setting ??= {}
	data[buildingId].setting[code] ??= {}
	data[buildingId].timestamp ??= {}
	data[buildingId].timestamp.setting ??= {}
	data[buildingId].timestamp.setting[code] ??= {}
	data[buildingId].timestamp.setting[code][product] = new Date()
	// Данная настройка относится к настройкам без продукта ?
	const isWithout = store.stgWithout.includes(code)
	// С продуктом
	if (!isWithout) {
		data[buildingId].setting[code][product] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null)
				data[buildingId].setting[code][product][fld] = val
			else
				data[buildingId].setting[code][product][fld] = {
					...data[buildingId].setting[code][product][fld],
					...val,
				}
		}

		return data
	}
	// Без продукта
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

	return data
}

module.exports = cb

/**
 * Проверка временных меток изменения настроек
 * @param {object} obj Данные 
 * @param {object} data Данные из retain.json (пользовательские настройки)
 * @return {boolean} true - разрешить запись, false - запретить запись
 */
function check(obj, data){
	// date Временная метка новых данных от мобильного приложения
	const { buildingId, code, product, value, date = null } = obj

	// Дата последнего изменения настройки
	let lastUpd = data?.[buildingId]?.update?.setting?.[code]?.[product]
	lastUpd = lastUpd ? new Date(lastUpd) : undefined
	// Разрешить запись: нет времени последней записи настроек
	if (!lastUpd) return true
	// Время 
	const update = date ? new Date(date) : undefined
	if (!lastRefresh || time <= lastRefresh) {
		console.log(
			'================================',
			data?.[buildingId]?.timestamp?.setting?.[code]?.[product]
		)
		return data
	}
}