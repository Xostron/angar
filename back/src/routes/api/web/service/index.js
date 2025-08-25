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
	reload_netmanager,
	wifi_info,
	wifi_manager,
	eth_info,
	eth_manager,
	file
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
	// Перезапуск сети
	serviceRouter.get('/reload_net', reload_netmanager());
	// Перезапуск сети
	serviceRouter.get('/wifi', wifi_info());
	serviceRouter.post('/wifi', wifi_manager());

	serviceRouter.get('/eth', eth_info());
	serviceRouter.post('/eth', eth_manager());

	// Установить файл с конфигурацией оборудования
	serviceRouter.post('/file', file())
}

module.exports = service;
