const { data } = require('@store');
const { battery, os, cpu, db } = require('./fn');
const get_net_info = require('@tool/scripts/get_net_info');
const time = require('@tool/scripts/time');

async function info() {
	const frontInfo = require('../../../../../front/package.json');
	const backInfo = require('../../../../package.json');
	// Зона POS: имя читаем из системы, смещение считаем по имени.
	// Процесс Node кэширует зону, поэтому после смены пояса
	// Intl.DateTimeFormat().resolvedOptions().timeZone останется прежней.
	const zone = time.systemZone();
	const obj = {
		ip: process.env.IP,
		back: backInfo.version,
		front: frontInfo.version,
		platform: process.platform,
		date: new Date(),
		// Зона POS: интерфейс показывает время в ней, даже если открыт удалённо
		timezone: zone,
		offset: time.zoneOffsetMin(zone),
		db: {
			status: '',
			version: '',
		},
		cpu: '',
		battery: {
			status: data.battery,
			level: null,
		},
	};

	// Linux
	if (obj.platform === 'linux') {
		obj.net = await get_net_info();
		obj.cpu = cpu(obj);
		obj.db = db(obj);
		obj.battery.level = battery(obj);
		obj.os = os(obj);
	}
	return obj;
}

module.exports = info;
