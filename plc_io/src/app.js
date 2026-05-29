const fastify = require('fastify')
const engineRouters = require('./routes')

// Инициализация fastify, подключение логирования
const app = fastify({
	logger: {
		// Переопределяем сериализаторы, чтобы Fastify физически
		// не мог собирать и выводить объекты 'res' и 'req' в логах
		serializers: {
			res() {
				return undefined
			},
			req() {
				return undefined
			},
		},
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss.l',
				ignore: 'pid,hostname,reqId,responseTime', // Игнорируем остатки полей
				messageFormat: '{msg}',
			},
		},
	},
})

// 3. Добавляем хук на завершение ответа (onResponse)
app.addHook('onResponse', (request, reply, done) => {
	// Логируем строго в нужном формате
	request.log.info(`${request.method} ${request.url}`)
	done()
})

// Роуты
app.register(engineRouters, { prefix: '/api/back' })

module.exports = app
