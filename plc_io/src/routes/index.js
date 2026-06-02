const value = require('./value')
const output = require('./output')
const reset = require('./reset')
const rack = require('./rack')

// Запросы от микросервиса ангара
// prefix = /api/back
async function connectRouters(app, options) {
	// Рама
	app.post('/rack', rack)
	// Запрос значений модулей
	app.get('/value', value)
	// Данные для записи модулей
	app.post('/output', output)
	// Сброс аварий модулей
	app.post('/reset', reset)
}

module.exports = connectRouters
