const Transport = require('winston-transport')
const { getDb, scheduleReconnect } = require('./db')
const { insert } = require('@tool/db')

// Кэш предыдущих записей для дедупликации (сбрасывается при перезагрузке)
const prev = {}

// Подавление повторяющихся ошибок: не спамить в консоль одну и ту же ошибку
let lastErrorTs = 0
const ERROR_THROTTLE = 60_000

/**
 * Кастомный Winston-транспорт: запись логов в MongoDB
 * Каждый level пишется в свою коллекцию БД "logs"
 * Дубликаты (подряд одинаковые message) пропускаются
 */
class MongoTransport extends Transport {
	constructor(opts = {}) {
		super(opts)
		this.targetLevel = opts.targetLevel
	}

	log(info, callback) {
		const db = getDb()
		if (!db) return callback()
		if (info.level !== this.targetLevel) return callback()

		const level = info.level
		const json = JSON.stringify(info.message)

		if (prev[level] === json) return callback()
		prev[level] = json

		insert(db, level, { ts: new Date(), ...info.message })
			.catch((err) => {
				const now = Date.now()
				if (now - lastErrorTs > ERROR_THROTTLE) {
					lastErrorTs = now
					console.error(`Логи MongoDB [${level}]: ${err.message}`)
				}
				scheduleReconnect()
			})

		callback()
	}
}

/**
 * Создаёт MongoTransport для указанного уровня логирования
 * @param {string} level Уровень лога (имя коллекции в БД)
 * @returns {MongoTransport|null}
 */
function mongoT(level) {
	if (!getDb()) return null
	return new MongoTransport({ level, targetLevel: level })
}

module.exports = { MongoTransport, mongoT }
