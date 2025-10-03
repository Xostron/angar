const begin = require('./def/begin')
const wait = require('./def/wait')
const prepare = require('./def/prepare')
const start = require('./def/start')
const finish = require('./def/finish')
// const stop = require('./def/stop')
const error = require('./def/error')

// Этапы калибровки
const def = {
	begin, // Начало
	prepare, // Подготовка (если клапан частично открыт)
	wait, // Ожидание концевика клапана
	start, // Начало калибровки (отсчет времени)
	finish, // Конец калибровки (результат)
	// stop, // Прерывание калибровки (команды ручного управления)
	error, // Прерывание калибровки (неисправность)
	null: () => {},
}

module.exports = def
