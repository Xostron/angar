const outputEq = require('./fn/output_eq')
const outputM = require('./fn/output_m')
const sensor = require('./fn/sensor')
const signal = require('./fn/signal')
const valve = require('./fn/valve')
const fan = require('./fn/fan')
const cooler = require('./fn/cooler')
const aggregate = require('./fn/aggregate')
const device = require('./fn/device')
/**
 * Преобразование прочитанных входов/выходов (коррекция, точность, клапан(концевики))
 * @param {*} val данные опроса модулей
 * @param {*} equip данные json по оборудованию
 * @returns {id_input: value,..., outputM:{id_module:[arr_value],...}}
 */
function periphery(val, obj) {
	const { data: equip, retain, ehour } = obj
	let result = {}

	// Маска выходных модулей DO
	result.outputM = outputM(equip, val)
	// Исполнительные механизмы: значение выхода
	result.outputEq = outputEq(equip, val)

	// console.log(result)
	// Анализ датчиков
	sensor(equip, val, retain, result)
	// Значения сигналов и состояние ИМ
	signal(equip, val, retain, result)

	// *************Состояния оборудования*************
	// Состояния клапанов
	valve(equip, val, retain, result)
	// Состояние вентиляторов (предварительное)
	fan(equip, val, retain, ehour, result)
	// Испаритель
	cooler(equip, val, retain, result)
	// Агрегат
	aggregate(equip, val, retain, result)
	// Устройства (СО2, увлажнитель)
	device(equip, val, retain, result)


	return result
}

module.exports = periphery
