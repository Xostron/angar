const get = require('./get')

// Запросы от микросервиса rw
function rw(router) {
	// Получить раму модулей и оборудования
	router.get('/rw/init', get())
}

module.exports = rw
