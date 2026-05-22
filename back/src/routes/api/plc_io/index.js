const get = require('./get')
const post = require('./post')

// Запросы от микросервиса rw
function plc_io(router) {
	// Запрос рамы модулей и оборудования
	router.get('/io/init', get())
	// Прием данных опроса модулей
	router.post('/io/value', post())
}

module.exports = plc_io
