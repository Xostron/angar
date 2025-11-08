const scan = require('@tool/command/scan')
const prepare = require('../prepare')
const def = require('./def')

// Автоматическое управление складами(cold, combi, normal)
function main(obj) {
	const { data } = obj
	// Подготовка обычного склада: (combi, normal) (переключение режимов работы секции, вкл/выкл склада)
	prepare(obj)

	// Обработка складов
	for (const bld of data.building) {
		// Данные по складу
		const bdata = scan(bld, obj)
		if (def?.[bld?.type]) def[bld?.type](bld, obj, bdata)
	}
}

module.exports = main
