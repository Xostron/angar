/**
 * Анализ: Формирование значений входов/выходов, режим работы секции, вкл/выкл склада
 * @param {*} val сырые данные с опроса модулей
 * @param {*} obj объект данных для работы основного цикла
 * @returns
 */
function value(obj) {
	const bldCard = []
	// Данные для web клиента
	return {
		...(obj.value ?? {}),
		retain: obj.retain,
		factory: obj.factory,
		time: new Date(),
		bldCard,
	}
}

module.exports = value
