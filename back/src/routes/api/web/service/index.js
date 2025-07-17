const mac = require('./mac')
const ip = require('./ip')
const reboot = require('./reboot')
const equipment = require('./equipment')
const software = require('./software')
const pm2 = require('./pm2')
const npm = require('./npm')
const express = require('express')

function service(router) {
	const serviceRouter = express.Router() // api/web/service
	router.use('/service', serviceRouter)
	// Текущий IP и Mac-адрес
	serviceRouter.get('/mac', mac())
	// Установить IP
	serviceRouter.post('/ip', ip())
	// Перезагрузка ОС
	serviceRouter.get('/reboot', reboot())
	// Обновить оборудование
	serviceRouter.get('/equipment', equipment())
	// Обновить ПО
	serviceRouter.get('/software', software())
	// pm2 restart
	serviceRouter.get('/pm2', pm2())
	// npm install && npm run build
	serviceRouter.get('/npm', npm())
}

module.exports = service
