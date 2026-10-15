const { suExecFile } = require('../fn');

const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Синхронизация времени (ntpdate в Linux Mint не установлен, используем systemd-timesyncd)
async function sync() {
	if (process.platform !== 'linux') {
		throw new Error('Not a Linux system');
	}
	await suExecFile('timedatectl', ['set-ntp', 'true']);
	await suExecFile('systemctl', ['restart', 'systemd-timesyncd']);
	return 'Время синхронизировано через systemd-timesyncd';
}

// Установка времени
async function set(dt) {
	if (process.platform !== 'linux') {
		throw new Error('Not a Linux system');
	}
	if (typeof dt !== 'string' || !DATE_TIME_REGEX.test(dt.trim())) {
		throw new Error('Некорректный формат даты и времени');
	}
	// sudo timedatectl set-time 'YYYY-MM-DD HH:MM:SS'
	await suExecFile('timedatectl', ['set-time', dt.trim()]);
	return 'Время установлено';
}

module.exports = { sync, set };
