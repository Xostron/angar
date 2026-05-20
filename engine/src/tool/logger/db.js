/**
 * Обёртка для доступа к БД "logs" через централизованный менеджер подключений.
 * Сохраняет обратную совместимость API (getDb, scheduleReconnect).
 */
const { get, scheduleReconnect } = require('@tool/db/state')

/** @returns {object|null} Текущее подключение к БД logs */
const getDb = () => get('logs')

module.exports = {
	getDb,
	scheduleReconnect: () => scheduleReconnect('logs'),
}
