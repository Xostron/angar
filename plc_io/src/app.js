const fastify = require('fastify')
const engineRouters = require('./routes')

// Инициализация fastify, подключение логирования
const app = fastify({
	logger:
		process.env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : true,
})

// Роуты
app.register(engineRouters, { prefix: '/api/engine' })

module.exports = app
