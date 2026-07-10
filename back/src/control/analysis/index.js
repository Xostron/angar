const { cValue } = require('@socket/emit')
const { readAll } = require('@tool/json')
const readM = require('./read')
const value = require('./value')
const { data: store } = require('@store')
const Aboc = require('@tool/abort_controller')
const { calcSetting, calcCoef } = require('../extra/setting')
const { fnDemo } = require('@tool/demo/init')
const periphery = require('./value/periphery')

/**
 * Анализ данных с модулей ПЛК и отправка на Web-клиент
 * @param {*} obj Глобальные данные - каждый цикл новый объект
 */
async function analysis(obj) {
	// файлы json - оборудование, пользовательские настройки, заводские настройки
	await readAll(obj)
	// Копирование аккумулятора retain в obj.retain
	obj.retain = store.retain

	// Сырые данные: чтение модулей (режим монолита/микросервеса)
	let v = obj.data.pc?.isIo ? store.v : await readM(obj)

	// Преобразование настроек пользователя
	Aboc.call(calcSetting)(obj)

	// Демо: инициализация и переключение по стадиям
	fnDemo(obj.data.building)

	// Анализ сырых данных: готовые состояния периферии
	Aboc.call(periphery)(v, obj)

	// Анализ - данные для клиента и работы алгоритма
	v = Aboc.call(value)(obj)

	// Настройки пользователя: расчет коэффициентов в зависимости от показаний датчиков
	Aboc.call(calcCoef)(v, obj)

	// Передача мяса по Socket.io на web-клиент
	console.log(123, Object.keys(v))
	await Aboc.asycall(cValue)(v)
}

module.exports = analysis
