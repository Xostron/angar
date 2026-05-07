const { cValue } = require('@socket/emit')
const { readAll } = require('@tool/json')
const readM = require('./read')
const value = require('./value')
const { data: store } = require('@store')
const Aboc = require('@tool/abort_controller')
const calcSetting = require('../extra/setting')

/**
 * Анализ данных с модулей ПЛК и отправка на Web-клиент
 * @param {*} obj Глобальные данные - каждый цикл новый объект
 */
async function analysis(obj) {
	// файлы json - оборудование, пользовательские настройки, заводские настройки
	await readAll(obj)
	// Копирование аккумулятора retain в obj.retain
	obj.retain = store.retain
	// Опрос модулей по сети
	let v = await readM(obj)
	// Анализ - данные для клиента и работы алгоритма
	v = Aboc.call(value)(v, obj)
	// Настройки складов (обработанные для расчетов)
	Aboc.call(calcSetting)(v, obj)
	// Передача мяса по Socket.io на web-клиент
	await Aboc.asycall(cValue)(v)
}

module.exports = analysis
