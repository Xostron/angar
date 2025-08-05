const path = require('path');
const fs = require('fs');
const rebuild = require('./rebuild');
const pm2 = require('./pm2');

// обновление IP в ecosystem.config.js и .env фронта
// путь к данным по умолчанию
const def = '/home/tenta/apps/back/data';
// const def = 'E:/Work/Projects/All/angar/back/data';
function set_new_ip(ip) {
	return new Promise(async (resolve, reject) => {
		const dir = path.join(process.env.PATH_DATA || def, '..', '..');

		// Обновляем IP в ecosystem.config.js
		try {
			const ecoPath = path.join(dir, 'ecosystem', 'ecosystem.config.js');
			let ecoContent = fs.readFileSync(ecoPath, 'utf8');
			// Находим строку IP: 'старый_ip', и заменяем на новый
			ecoContent = ecoContent.replace(/IP:\s*'[^']*'/, `IP: '${ip}'`);
			fs.writeFileSync(ecoPath, ecoContent, 'utf8');
		} catch (e) {
			console.error(
				'Ошибка при обновлении ecosystem.config.js:',
				e.message
			);
			return reject(e);
		}

		// Обновляем PUBLIC_SOCKET_URI в .env фронта
		try {
			const frontEnvPath = path.join(dir, 'front', '.env');
			let envContent = fs.readFileSync(frontEnvPath, 'utf8');
			// Заменяем строку PUBLIC_SOCKET_URI на новую с ip
			envContent = envContent.replace(
				/\nPUBLIC_SOCKET_URI=[^\r\n]*/,
				`\nPUBLIC_SOCKET_URI=http://${ip}:4000`
			);
			envContent = envContent.replace(
				/\nPUBLIC_API=[^\r\n]*/,
				`\nPUBLIC_API=http://${ip}:4000/api/`
			);
			envContent = envContent.replace(
				/\nPUBLIC_LOCAL_API=[^\r\n]*/,
				`\nPUBLIC_LOCAL_API=http://${ip}:4000/api/`
			);
			fs.writeFileSync(frontEnvPath, envContent, 'utf8');
		} catch (e) {
			console.error('Ошибка при обновлении .env фронта:', e.message);
			return reject(e);
		}
		console.log('IP обновлён на', ip);
		console.log('Сборка ...');
		await rebuild();
		console.log('Перезапуск pm2...');
		pm2('restart');

		resolve({ success: true, message: `IP обновлён на ${ip}` });
	});
}

module.exports = set_new_ip;
