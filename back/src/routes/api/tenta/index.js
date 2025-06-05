const value = require('./get/value')
const write = require('./post')
const read = require('./read')
const advice = require('./advice')

function tenta(router) {
	// Запись данных: настройки, команды управления
	router.post('/tenta/write/:code', write())
	// Состояние входов/выходов датчиков
	router.get('/tenta/value', value())
	// Чтение мяса
	router.use('/tenta/read', read())
	router.get('/tenta/advice', advice())
}

module.exports = tenta
