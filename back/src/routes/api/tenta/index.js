const value = require('./get/value')
const write = require('./post')
const read = require('./read')
const advice = require('./advice')
const state = require('./state')

function tenta(router) {
	// Запись данных (воркирование/таскирование): настройки, команды управления
	router.post('/tenta/write/:code', write())
	// Состояние входов/выходов датчиков
	router.get('/tenta/value', value())
	// Чтение мяса для Виктора
	router.use('/tenta/read', read())
	// Данные для аналитики по погоде
	router.get('/tenta/advice', advice())
	// Данные state - Обмен данными через ЦС
	router.get('/tenta/state', state())
}

module.exports = tenta
