const value = require('./get/value');
const write = require('./post');
const read = require('./read');

function tenta(router) {
	// Запись данных: настройки, команды управления
	router.post('/tenta/write/:code', write());
	// Все значения датчиков
	router.get('/tenta/value', value());
	router.use('/tenta/read', read());
}

module.exports = tenta;
