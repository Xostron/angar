const pc = require('./pc');
const signal = require('./signal');
const getStore = require('./store');
const setting = require('./setting');
const sensor = require('./sensor');
const monitoring = require('./monitoring')
const express = require('express');
const router = express.Router();

function read() {
	// Карточки PC
	router.get('/pc', pc());
	// Карточки секций || секция
	router.get('/store/:bldId/:secId', getStore());
	// Экран датчики
	router.get('/sensor/:bldId/:secId', sensor());
	// Экран сигналы
	router.get('/signal/:bldId', signal());
	// Экран настройки
	router.get('/setting/:bldId/:codeS/:codeP', setting());
	// Экран мониторинг
	router.get('/monitoring/:bldId', monitoring());
	return router;
}

module.exports = read;
