const { cValue } = require('@socket/emit')
const { readAll } = require('@tool/json')
const read = require('./read')
const value = require('./value')

/**
 * Анализ данных с модулей ПЛК и отправка на Web-клиент
 * @param {*} obj объект данных для работы основного цикла
 */
async function analysis(obj) {
	// файлы json - оборудование, пользовательские настройки, заводские настройки
	await readAll(obj)
	// Опрос модулей по сети
	let v = await read(obj)
	// console.log(777, 'AO', v['6800b9d356c6a01c90ecbc72'])
	// Анализ - данные для клиента и работы алгоритма
	v = await value(v, obj)
	// Передача мяса по Socket.io на web-клиент
	// console.log(2222, v.total['6800c32305912407c0b68bfb'])
	await cValue(v)
}

module.exports = analysis
