const { execSync } = require('child_process');

// Синхронизация времени
function sync() {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject(new Error('Not a Linux system'));
			}
			const result = execSync('sudo ntpdate -ubv 0.ru.pool.ntp.org');
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

// Установка времени
function set(dt) {
	return new Promise((resolve, reject) => {
		console.log('set_time dt', dt, typeof dt);
		if (process.platform !== 'linux') {
			return reject(new Error('Not a Linux system'));
		}
		// sudo timedatectl set-time 'YYYY-MM-DD HH:MM:SS'
		const cmd = `sudo timedatectl set-time '${dt}'`;
		console.log('set_time cmd', cmd);
		try {
			const result = execSync(cmd);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = { sync, set };
