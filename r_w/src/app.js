const fastify = require('fastify')
// const ordersRoutes = require('./routes/orders')

// Инициализация fastify, подключение логирования
const app = fastify({
	logger:
		process.env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : true,
})

// ping
app.get('/health', async () => {
	return { status: 'OK', timestamp: new Date() }
})

// Роуты
// app.register(ordersRoutes, { prefix: '/api/v1' })

module.exports = app
