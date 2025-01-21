const { format } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const path = require('path')
const { combine, timestamp, json } = format


/**
 * Фильтр, пропускающий только указанный уровень
 * (иначе запись отбрасывается).
 */
const filterOnly = (level) => {
	return format((info) => {
		return info.level === level ? info : false
	})()
}

/**
 * Объект с приоритетами уровней.
 * По умолчанию у Winston есть эти же уровни,
 * но здесь они явно определены для демонстрации.
 */
const customLevels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,

	fan: 7,
	valve: 8,
	heating: 9,
	solenoid: 10,
	cooler: 11,
	aggregate: 12,
	compressor: 13,
	condenser: 14,
	device: 15,
	building: 16, // События склада и секций: таймеры запретов, аварии авторежимов,
	activity: 17, // Действия пользователя
	sensor: 18,
	alarm: 19, // Неисправности
	watt:20 // Электросчетчик
}

/**
 * Создаём функцию, которая генерирует DailyRotateFile-транспорт
 * для конкретного уровня, чтобы избежать копирования кода.
 */
function hourlyT(level) {
	return new DailyRotateFile({
		level,
		filename: path.join(process.env.PATH_LOG, `${level}-%DATE%.log`),
		// Ротация по часу: "YYYY-MM-DD-HH"
		datePattern: 'YYYY-MM-DD-HH',
		// Сколько файлов хранить (пример: 24 часа)
		// Если хотите хранить дольше, можно ставить '7d' и т.п.
		maxFiles: '7d',
		// Формат лога
		format: combine(
			filterOnly(level), // пропускаем только нужный level
			timestamp(),
			json()
		),
	})
}

module.exports = { hourlyT, customLevels }
