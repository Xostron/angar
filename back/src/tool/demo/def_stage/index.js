const accel = require('./accel')
const allFan = require('./all_fan')
const coolerCool = require('./cooler_cool')
const coolerFlap = require('./cooler_flap')
const coolerHeat = require('./cooler_heat')
const fan = require('./fan')
const heat = require('./heat')
const ozon = require('./ozon')
const valve = require('./valve')
const wetting = require('./wetting')

const data = {
	accel,
	allFan,
	fan,
	heat,
	valve,
	wetting,
	ozon,
	coolerCool,
	coolerFlap,
	coolerHeat,
}

/**
 * Обход тестов
 * Тесты выполняются по очереди из checklist,
 * Неактивные тесты - выключают свои исполнительные мех-мы
 * Активные тесты - включают свои исполнительные мех-мы
 * Активный тест - code, выбирается на основе demo.order - порядковый номер теста и
 * массива тестов checklist
 * @param {*} bld Склад
 * @param {*} obj Глобальный объект
 * @param {*} code Код теста
 */
function runTests(bld, m, demo, checklistPNR, obj, code) {
	checklistPNR.forEach((el) => {
		// Проход по тестам совместимые с типом склада
		if (!el.type.includes(bld.type)) return
		data[el.code](
			bld,
			obj,
			m,
			checklistPNR,
			demo,
			code === el.code, // Разрешение на работу теста
			code,
		)
	})
}

module.exports = runTests
