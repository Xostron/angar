const equip = require('./equipment');
const express = require('express');
const {
	net_info,
	set_ip,
	reload,
	upt_soft,
	pm2_cmd,
	build,
	autoLogin,
} = require('./services');

// TODO Рома ip, reboot, software,pm2,npm
function service(router) {
	const serviceRouter = express.Router(); // api/web/service
	router.use('/service', serviceRouter);
	// Текущий IP и Mac-адрес
	serviceRouter.get('/net_info', net_info());
	// Установить IP
	serviceRouter.post('/set_ip', set_ip());
	// Перезагрузка ОС
	serviceRouter.get('/reboot', reload());
	// Обновить оборудование
	serviceRouter.get('/equipment', equip());
	// Обновить ПО
	serviceRouter.get('/upt_soft', upt_soft());
	// pm2 restart
	serviceRouter.get('/pm2/:code', pm2_cmd());
	// npm install && npm run build
	serviceRouter.get('/build', build());
	// AutoLogin On/Off
	serviceRouter.get('/auto_login/:flag', autoLogin());
}

module.exports = service;
