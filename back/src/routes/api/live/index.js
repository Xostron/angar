const ping = require('./ping')
const on = require('./on')
const off = require('./off')
const battery = require('./battery')
const stop = require('./stop')

function live(router) {
	// Пинг - рестарт сервера ангара
	router.get('/live/ping', ping())
	// Сеть вкл
	router.get('/live/on', on())
	// Сеть выкл
	router.get('/live/off', off())
	// От аккумулятора
	router.get('/live/battery', battery())
	// Выключение
	router.get('/live/stop', stop())
}

module.exports = live
