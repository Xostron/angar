// const value = require('./value')
const output = require('./output')
const reset = require('./reset')

// Запросы от микросервиса ангара
// prefix = /api/back
async function connectRouters(app, options) {
	// // Запрос значений модулей
	// app.get('/value', value)
	// Данные для записи модулей
	app.post('/output', output)
	// Сброс аварий модулей
	app.post('/reset', reset)
}

module.exports = connectRouters
