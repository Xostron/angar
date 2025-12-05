const { readFileSync } = require('fs');
const { execSync } = require('child_process');
const get_net_info = require('@tool/scripts/get_net_info');
const { data } = require('@store');

async function info() {
	const frontInfo = require('../../../../../front/package.json');
	const backInfo = require('../../../../package.json');
	const obj = {
		ip: process.env.IP,
		back: backInfo.version,
		front: frontInfo.version,
		platform: process.platform,
		date: new Date(),
		battery: {
			status: data.battery,
			level: null,
		},
	};

	if (obj.platform === 'linux') {
		obj.net = await get_net_info();
		obj.os = 'unknown';
		try {
			// Удаляем escape-последовательности типа \n \l \r и т.д.
			const issue = readFileSync('/etc/issue', 'utf8')
				.replace(/\\[a-z]/g, '')
				.trim();
			obj.os = issue;
		} catch (e) {
			console.error('\x1b[33m%s\x1b[0m /etc/issue', e.message);
		}
		// Добавляем информацию о батарее, если есть команда acpi
		try {
			// Проверяем доступна ли команда acpi
			let acpiOut = null;
			acpiOut = execSync('acpi -b', { encoding: 'utf8' }).trim();
			if (acpiOut && acpiOut.length > 0) {
				const match = acpiOut.match(/(\d+)%/);
				if (match) {
					const batteryLevel = parseInt(match[1], 10);
					obj.battery.level = batteryLevel;
				}
			}
		} catch (e) {
			console.error('\x1b[33m%s\x1b[0m acpi -b', e.message);
		}
	}
	return obj;
}

module.exports = info;
