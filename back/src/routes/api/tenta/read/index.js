const pc = require('./pc');
const signal = require('./signal');
const getStore = require('./store');
const setting = require('./setting');
const sensor = require('./sensor');
const express = require('express');
const router = express.Router();

function read() {
	// Создаем подмаршрутизатор

	// Значения (датчики, настройки, режимы)
	router.get('/pc', pc());
	// Значения датчиков по коду склада, коду  настроки и коду продукта
	router.get('/store/:bldId/:secId', getStore());
	router.get('/sensor/:bldId/:secId', sensor());
	router.get('/signal/:bldId', signal());
	router.get('/setting/:bldId/:codeS/:codeP', setting());

	return router;
}

module.exports = read;
