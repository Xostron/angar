const equip = require('./equipment');
const express = require('express');
const { serviceLog } = require('@root/stat/activity');
const {
	net_info,
	set_ip,
	reload,
	shutdown,
	upt_soft,
	pm2_cmd,
	build,
	autoLogin,
	reload_netmanager,
	wifi_list,
	wifi_connect,
	eth_info,
	eth_manager,
	ping,
	file,
	sync_time,
	set_time,
	disconnect_wifi,
	switching,
	keyboard,
	statClear,
	statInfo,
	saveSettings,
	getSettings,
	close_chrom,
} = require('./services');

function service(router) {
	const serviceRouter = express.Router(); // api/web/service
	router.use('/service', serviceRouter);
	// Текущий IP и Mac-адрес
	serviceRouter.get('/net_info', net_info());
	// Установить IP
	serviceRouter.post(
		'/set_ip',
		log('network', (req) => `Установка IP: ${req.body?.ip ?? ''}`, (req) => req.body?.ip),
		set_ip(),
	);
	// Перезагрузка PC
	serviceRouter.get('/reboot', log('pos', 'Перезагрузка PC'), reload());
	// Выключение PC
	serviceRouter.get('/shutdown', log('pos', 'Выключение PC'), shutdown());
	// Обновить оборудование
	serviceRouter.get('/equipment', log('config', 'Обновление конфигурации оборудования'), equip());
	// Обновить ПО
	serviceRouter.get('/upt_soft', log('soft', 'Обновление ПО'), upt_soft());
	// pm2 restart
	serviceRouter.get(
		'/pm2/:code',
		log('soft', (req) => `PM2: ${req.params.code}`, (req) => req.params.code),
		pm2_cmd(),
	);
	// npm install && npm run build
	serviceRouter.get('/build', log('soft', 'Сборка проекта'), build());
	// AutoLogin On/Off
	serviceRouter.get(
		'/auto_login/:flag',
		log('pos', (req) => `AutoLogin: ${req.params.flag}`),
		autoLogin(),
	);
	// Перезапуск сети
	serviceRouter.get('/reload_net', log('network', 'Перезагрузка сети'), reload_netmanager());
	// Список доступных wifi точек доступа
	serviceRouter.get('/wifi', wifi_list());
	// Подключение к wifi точке доступа
	serviceRouter.post(
		'/wifi',
		log('network', (req) => `WiFi: подключение ${req.body?.ssid ?? ''}`, (req) => req.body?.ssid),
		wifi_connect(),
	);
	// Отключение от wifi точке доступа
	serviceRouter.post('/disconnect_wifi', log('network', 'Отключение WiFi'), disconnect_wifi());
	// Переключение интерфейса включение или выключение
	serviceRouter.post(
		'/switching',
		log('network', (req) => `WiFi: ${req.body?.state === 'on' ? 'включение' : 'выключение'}`),
		switching(),
	);
	// Информация о сетевых интерфейсах
	serviceRouter.get('/eth', eth_info());
	// Проверка доступности устройств по IP/домену
	serviceRouter.post('/ping', ping());
	// Управление сетевыми интерфейсами
	serviceRouter.post(
		'/eth',
		log('network', (req) => `Настройка Ethernet: ${req.body?.mode ?? ''}`, (req) => req.body?.ip),
		eth_manager(),
	);
	// Синхронизировать время через интернет
	serviceRouter.get('/sync_time', log('pos', 'Синхронизация времени'), sync_time());
	// Установить время и дату вручную
	serviceRouter.post(
		'/set_time',
		log('pos', 'Установка даты и времени', (req) => req.body?.dt),
		set_time(),
	);

	// Установить файл с конфигурацией оборудования
	serviceRouter.post('/file', log('config', 'Установка конфигурации из файла'), file());
	serviceRouter.post(
		'/keyboard',
		log(
			'config',
			(req) => `Экранная клавиатура: ${req.body?.value ? 'включена' : 'отключена'}`,
			(req) => req.body?.value,
		),
		keyboard(),
	);

	// Статистика
	serviceRouter.get('/stat', statInfo());
	serviceRouter.delete('/stat', log('config', 'Очистка статистики'), statClear());

	// Управление настройками
	serviceRouter.post('/settings', log('config', 'Сохранение настроек на сервере'), saveSettings());
	serviceRouter.get('/settings', log('config', 'Загрузка настроек с сервера'), getSettings());
	// Закрытие браузера
	serviceRouter.get('/close_chrom', log('pos', 'Закрытие браузера'), close_chrom());
}

/**
 * Middleware логирования служебного действия в «Архив действий» (в начале обработки)
 * @param {string} type Раздел: network | soft | config | pos
 * @param {string|function} title Заголовок или функция (req) => string
 * @param {function} [valueFn] Значение (req) => any
 */
function log(type, title, valueFn) {
	return (req, res, next) => {
		try {
			const value = valueFn ? valueFn(req) : undefined;
			serviceLog({
				title: typeof title === 'function' ? title(req) : title,
				type,
				value,
			});
		} catch (e) {
			console.error('serviceLog error:', e.message);
		}
		next();
	};
}

module.exports = service;
