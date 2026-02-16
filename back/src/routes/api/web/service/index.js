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
	wifi_list,
	wifi_connect,
	eth_info,
	eth_manager,
	file,
	sync_time,
	set_time,
	disconnect_wifi,
	keyboard,
	statClear,
	statInfo,
	saveSettings,
	getSettings,
} = require('./services');

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
	// Список доступных wifi точек доступа
	serviceRouter.get('/wifi', wifi_list());
	// Подключение к wifi точке доступа
	serviceRouter.post('/wifi', wifi_connect());
	// Отключение от wifi точки доступа
	serviceRouter.post('/disconnect_wifi', disconnect_wifi());
	// Переключение интерфейса включение или выключение
	// serviceRouter.post('/switching', switching());
	// Информация о сетевых интерфейсах
	serviceRouter.get('/eth', eth_info());
	// Управление сетевыми интерфейсами
	serviceRouter.post('/eth', eth_manager());
	// Синхронизировать время через интернет
	serviceRouter.get('/sync_time', sync_time());
	// Установить время и дату вручную
	serviceRouter.post('/set_time', set_time());

	// Установить файл с конфигурацией оборудования
	serviceRouter.post('/file', file());
	serviceRouter.post('/keyboard', keyboard());

	// Статистика
	serviceRouter.get('/stat', statInfo());
	serviceRouter.delete('/stat', statClear());

	// Управление настройками
	serviceRouter.post('/settings', saveSettings());
	serviceRouter.get('/settings', getSettings());
}

module.exports = service;
