const { execSync } = require('child_process');

function reload_net() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return resolve('Не на Linux системе');
		}
		// INSERT_YOUR_CODE
		const fs = require('fs');
		const path = '/etc/NetworkManager/NetworkManager.conf';
		try {
			if (fs.existsSync(path)) {
				console.log('reload_net path', path);
				let content = fs.readFileSync(path, 'utf8');
				const managedRegex = /^(\s*managed\s*=\s*)false(\s*)$/m;
				if (managedRegex.test(content)) {
					content = content.replace(managedRegex, '$1true$2');
					console.log('reload_net content', content);
					fs.writeFileSync(path, content, 'utf8');
				}
			}
		} catch (e) {
			return reject({
				success: false,
				message:
					'Ошибка при проверке/замене managed в NetworkManager.conf: ' +
					e.message,
			});
		}
		console.log('reload_net restart NetworkManager');
		try {
			execSync('sudo systemctl restart NetworkManager', {
				encoding: 'utf8',
			});
			resolve({
				success: true,
				message: 'Перезапуск сети завершен',
			});
		} catch (e) {
			reject({
				success: false,
				message: e.message,
			});
		}
	});
}
module.exports = reload_net;
