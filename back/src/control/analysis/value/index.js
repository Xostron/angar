const periphery = require('./periphery')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(val, obj) {
	return new Promise((resolve, reject) => {
		if (!val) return resolve(null)
		// Преобразование прочитанных входов/выходов
		const data = periphery(val, obj.data, obj.retain)
		// Данные для главного цикла
		obj.value = { ...data }
		obj.errBuilding = val.error
		// Данные для web клиента
		resolve({ ...data, retain: obj.retain, factory: obj.factory, time: new Date(), errBuilding: val.error })
	})
}

module.exports = value
