const { data: store } = require('@store')

/**
 * Обновление данных в настройках retain.json
 * @param {*} acc Данные от web клиента (obj.value - основные данные)
 * @param {*} result Данные из файла json
 * @return {object} Данные retain + данные от клиента
 */
function cb(acc, result) {
	const { pcId, buildingId, code, product, value, date = null } = acc
	// Данная настройка относится к настройкам без продукта ?
	const isWithout = store.stgWithout.includes(code)
	if (!check(acc, result, isWithout)) return
	// Запись разрешена
	result[buildingId].setting ??= {}
	result[buildingId].setting[code] ??= {}
	result[buildingId].update ??= {}
	result[buildingId].update.setting ??= {}

	// С продуктом
	if (!isWithout) {
		result[buildingId].update.setting[code] ??= {}
		result[buildingId].update.setting[code][product] = new Date()
		result[buildingId].setting[code][product] ??= {}
		for (const fld in value) {
			const val = value[fld]
			if (typeof val != 'object' || val == null)
				result[buildingId].setting[code][product][fld] = val
			else
				result[buildingId].setting[code][product][fld] = {
					...result[buildingId].setting[code][product][fld],
					...val,
				}
		}
		return
	}
	// Без продукта
	result[buildingId].setting[code] ??= {}
	result[buildingId].update.setting[code] = new Date()
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

module.exports = cb

/**
 * Проверка временных меток изменения настроек
 * @param {object} obj Данные из запроса
 * @param {object} result Данные из retain.json (пользовательские настройки)
 * @param {boolean} isWithout Настройка с продуктом false / без true
 * @return {boolean} true - разрешить запись, false - запретить запись
 */
function check(obj, result, isWithout) {
	// date Временная метка новых данных от мобильного приложения
	const { buildingId, code, product, value, date = null } = obj

	// Дата последнего изменения настройки
	isWithout
	let lastUpd = isWithout
		? result?.[buildingId]?.update?.setting?.[code]
		: result?.[buildingId]?.update?.setting?.[code]?.[product]
	lastUpd = lastUpd ? new Date(lastUpd) : undefined
	// Разрешить запись: нет времени последней записи настроек
	if (!lastUpd) {
		console.log('===========', 'Разрешить запись. Нет времени последней записи настроек')
		return true
	}
	// Время
	const update = date ? new Date(date) : undefined
	// Разрешить запись: не указано время в запросе
	if (!update) {
		console.log('===========', 'Разрешить запись. Не указано время в запросе')
		return true
	}
	const r = update > lastUpd
	r
		? console.log(
				'===========',
				'Разрешить запись. Новые данные: Время запроса > Времени последнего обновления'
		  )
		: console.log(
				'===========',
				'Запретить запись. Устаревшие данные: Время запроса <= Времени последнего обновления (устаревшее)'
		  )
	return r
}
