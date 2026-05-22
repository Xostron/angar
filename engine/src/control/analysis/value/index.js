const periphery = require('./periphery')
const Aboc = require('@tool/abort_controller')

/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(val, obj) {
	// Преобразование прочитанных входов/выходов
	const data = Aboc.call(periphery)(val, obj)
	if (!data) return
	// Данные для главного цикла
	obj.value = { ...data }
	obj.errBuilding = val.error
	// Данные для web клиента
	return {
		...data,
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
		errBuilding: val.error,
	}
}

module.exports = value
