const outputEq = require('./fn/output_eq')
const outputM = require('./fn/output_m')
const sensor = require('./fn/sensor')
const signal = require('./fn/signal')
const valve = require('./fn/valve')
const fan = require('./fn/fan')
const cooler = require('./fn/cooler')
const aggregate = require('./fn/aggregate')
const device = require('./fn/device')
const building = require('./fn/building')

/**
 * Преобразование прочитанных входов/выходов (коррекция, точность, клапан(концевики))
 * @param {*} v данные опроса модулей
 * @param {*} equip данные json по оборудованию
 * @returns {id_input: value,..., outputM:{id_module:[arr_value],...}}
 */
function periphery(v, obj) {
	const { data: equip, retain } = obj
	let r = {}
	// Маска выходных модулей DO, AO
	r.outputM = outputM(equip, v)
	// Исполнительные механизмы: значение выхода
	r.outputEq = outputEq(equip, v)
	// Анализ датчиков
	sensor(equip, v, retain, r)
	// Значения сигналов и состояние ИМ
	signal(equip, v, retain, r)

	// *************Состояния оборудования*************
	// Состояния клапанов
	valve(equip, v, retain, r)
	// Состояние вентиляторов (предварительное)
	fan(equip, v, retain, r)
	// Агрегат
	aggregate(equip, v, retain, r)
	// Испаритель
	cooler(equip, v, retain, r)
	// Устройства (СО2, увлажнитель)
	device(equip, v, retain, r)
	// Состояние склада (подрежим работы)
	building(equip, v, retain, r)

	if (!r) {
		obj.value = null
		return
	}

	obj.value = { ...r }
}

module.exports = periphery
