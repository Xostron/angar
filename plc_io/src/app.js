const fastify = require('fastify')
const engineRouters = require('./routes')

// Инициализация fastify, подключение логирования
const app = fastify({
	logger: {
		transport: {
			target: 'pino-pretty', // если вы используете красивый вывод в консоль
			options: {
				translateTime: 'HH:MM:ss.l', // формат времени как у вас [16:25:44.169]
				ignore: 'pid,hostname,req', // скрываем стандартный большой объект req и лишние поля
			},
		},
		// Переносим метод и URL в саму строку сообщения INFO
		formatters: {
			log(object) {
				if (object.req) {
					object.msg = `incoming request: ${object.req.method} "${object.req.url}"`
				}
				return object
			},
		},
		// Оставляем сериализатор пустым, чтобы объект req вообще не писался в лог
		serializers: {
			req: () => undefined,
		},
	},
})

// Роуты
app.register(engineRouters, { prefix: '/api/back' })

module.exports = app
