const ping = require('./ping')
const on = require('./on')
const off = require('./off')
const battery = require('./battery')
const stop = require('./stop')
const express = require('express')

function live(router) {
	const liveRouter = express.Router()
	router.use('/live', liveRouter)
	// Пинг - рестарт сервера ангара
	liveRouter.get('/ping', ping())
	// Сеть вкл
	liveRouter.get('/on', on())
	// Сеть выкл
	liveRouter.get('/off', off())
	// От аккумулятора
	liveRouter.get('/battery', battery())
	// Выключение
	liveRouter.get('/stop', stop())
}

module.exports = live
