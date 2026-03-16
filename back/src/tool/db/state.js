/**
 * Централизованный менеджер подключений к MongoDB.
 * Хранит все подключения в Map по имени БД.
 * Автопереподключение при потере связи.
 */
let mongojs = null
try {
	mongojs = require('mongojs')
} catch {
	console.warn('MongoDB: mongojs не установлен, работа с БД отключена')
}

const RECONNECT_INTERVAL = 30_000

/** @type {Map<string, object>} */
const connections = new Map()
/** @type {Map<string, NodeJS.Timeout>} */
const timers = new Map()

/**
 * Подключиться к БД по имени.
 * URI формируется как BD_URI + name.
 * @param {string} name — имя базы данных (например 'angar', 'logs')
 * @returns {object|null} mongojs-подключение или null при ошибке
 */
function connect(name) {
	if (!mongojs) return null

	const base = process.env.BD_URI
	if (!base) {
		console.warn(`MongoDB [${name}]: BD_URI не задан`)
		return null
	}

	const uri = base.endsWith('/') ? base + name : base + '/' + name

	try {
		const existing = connections.get(name)
		if (existing) {
			try { existing.close() } catch { /* ignore */ }
		}

		const db = mongojs(uri)
		db.on('error', () => {
			console.warn(`MongoDB [${name}]: нет связи`)
			scheduleReconnect(name)
		})
		db.on('connect', () => {
			console.warn(`MongoDB [${name}]: связь установлена`)
			stopReconnect(name)
		})

		connections.set(name, db)
		return db
	} catch (err) {
		console.error(`MongoDB [${name}]: ошибка подключения`, err.message)
		connections.set(name, null)
		scheduleReconnect(name)
		return null
	}
}

/**
 * Получить текущее подключение по имени
 * @param {string} name — имя БД
 * @returns {object|null}
 */
function get(name) {
	return connections.get(name) || null
}

/**
 * Запланировать переподключение к БД
 * @param {string} name — имя БД
 */
function scheduleReconnect(name) {
	if (timers.has(name)) return
	timers.set(name, setTimeout(() => {
		timers.delete(name)
		console.warn(`MongoDB [${name}]: попытка переподключения...`)
		connect(name)
	}, RECONNECT_INTERVAL))
}

/**
 * Остановить запланированное переподключение
 * @param {string} name — имя БД
 */
function stopReconnect(name) {
	const timer = timers.get(name)
	if (timer) {
		clearTimeout(timer)
		timers.delete(name)
	}
}

/**
 * Создание TTL-индексов для указанных коллекций
 * @param {string} name — имя БД
 * @param {string[]} collections — имена коллекций
 * @param {string} field — поле для индекса
 * @param {number} ttlSeconds — время жизни документа в секундах
 */
function ensureIndexes(name, collections, field, ttlSeconds) {
	const db = get(name)
	if (!db) return
	for (const col of collections) {
		db[col].createIndex({ [field]: 1 }, { expireAfterSeconds: ttlSeconds })
	}
}

module.exports = { connect, get, scheduleReconnect, stopReconnect, ensureIndexes }
