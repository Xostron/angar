const fs = require('fs');
const { suExecFileSync } = require('./fn');

const NM_CONF_PATH = '/etc/NetworkManager/NetworkManager.conf';

function reload_net() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return resolve('Не на Linux системе');
		}
		try {
			if (fs.existsSync(NM_CONF_PATH)) {
				let content = fs.readFileSync(NM_CONF_PATH, 'utf8');
				const managedRegex = /^(\s*managed\s*=\s*)false(\s*)$/m;
				if (managedRegex.test(content)) {
					content = content.replace(managedRegex, '$1true$2');
					// Запись в системный конфиг требует root
					suExecFileSync('tee', [NM_CONF_PATH], { input: content });
				}
			}
			suExecFileSync('systemctl', ['restart', 'NetworkManager']);
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
