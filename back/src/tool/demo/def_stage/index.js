const { checklist } = require('../fn/init_data')
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
function runTests(bld, m, demo, obj, code) {
	checklist.forEach((el) => {
		data[el.code](
			bld,
			obj,
			m,
			demo,
			code === el.code, // Разрешение на работу теста
			code,
		)
	})
}

module.exports = runTests
