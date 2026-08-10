const { execFileSync } = require('child_process');
const { suExecFileSync } = require('../fn');

const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Синхронизация времени (ntpdate в Linux Mint не установлен, используем systemd-timesyncd)
function sync() {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject(new Error('Not a Linux system'));
			}
			suExecFileSync('timedatectl', ['set-ntp', 'true']);
			suExecFileSync('systemctl', ['restart', 'systemd-timesyncd']);
			resolve('Время синхронизировано через systemd-timesyncd');
		} catch (error) {
			reject(error);
		}
	});
}

// Установка времени
function set(dt) {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return reject(new Error('Not a Linux system'));
		}
		if (typeof dt !== 'string' || !DATE_TIME_REGEX.test(dt.trim())) {
			return reject(new Error('Некорректный формат даты и времени'));
		}
		// sudo timedatectl set-time 'YYYY-MM-DD HH:MM:SS'
		try {
			suExecFileSync('timedatectl', ['set-time', dt.trim()]);
			resolve('Время установлено');
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = { sync, set };
