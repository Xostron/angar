const status = require('./status')
const value = require('./value')
const output = require('./output')

// Запросы от микросервиса ангара
// prefix = /api/engine
async function connectRouters(app, options) {
	// Запрос статуса модулей
	app.get('/status', status)
	// Запрос значений модулей
	app.get('/value', value)
	// Данные для записи модулей
	app.post('/output', output)
}

module.exports = connectRouters
