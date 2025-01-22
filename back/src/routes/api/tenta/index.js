const value = require('./get/value')
const write = require('./post')
const read = require('./read')

function tenta(router) {
	// Запись данных: настройки, команды управления
	router.post('/tenta/write/:code', write())
	// Состояние входов/выходов датчиков
	router.get('/tenta/value', value())
	// Чтение мяса
	router.use('/tenta/read', read())
}

module.exports = tenta
