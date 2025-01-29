const prepare = require('../prepare')
const  scan  = require('@tool/command/scan')
const def = require('./def')

// Автоматическое управление
function main(obj) {
	const { data } = obj
	// Подготовка обычного склада: (переключение режимов работы секции, вкл/выкл склада)
	prepare(obj)
	// TODO Узнать требуется ли подготовка для холодильника (вкл/выкл склада)

	// Обработка складов
	for (const bld of data.building) {
		// Данные по складу
		const bdata = scan(bld, obj)
		if (def?.[bld?.type]) def[bld?.type](bld, obj, bdata)
	}
}

module.exports = main
