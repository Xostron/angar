const { fnDetection } = require('@tool/sensor/fn')
const vSensor = require('@tool/sensor')
const total = require('./total')
// const fnBindingAI = require('@tool/sensor/binding')

/**
 * Аналоговые датчики
 * Преобразование с учетом точности и коррекции
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} result результат (отображение)
 *
 */
function sensor(equip, val, retain, result) {
	// Анализ датчика (result[s._id] - датчики отображаются на экране настроек датчиков,
	// result.total - значения датчиков для расчетов алгоритма и отображения на мнемосхемах )
	vSensor(equip, val, retain, result)
	// Проверка по секционно датчиков температуры продукта
	fnDetection(equip, result, retain)
	// Аналоговые входы из binding
	// fnBindingAI(equip, val, retain, result)
	// Готовые результаты по датчикам
	total(equip, result, retain)
}

module.exports = sensor
