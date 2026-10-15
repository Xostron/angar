const fs = require('fs');
const { suExecFile } = require('./fn');

const NM_CONF_PATH = '/etc/NetworkManager/NetworkManager.conf';

async function reload_net() {
	if (process.platform !== 'linux') {
		return { success: false, message: 'Не на Linux системе' };
	}
	try {
		if (fs.existsSync(NM_CONF_PATH)) {
			let content = fs.readFileSync(NM_CONF_PATH, 'utf8');
			const managedRegex = /^(\s*managed\s*=\s*)false(\s*)$/m;
			if (managedRegex.test(content)) {
				content = content.replace(managedRegex, '$1true$2');
				// Запись в системный конфиг требует root
				await suExecFile('tee', [NM_CONF_PATH], { input: content });
			}
		}
		await suExecFile('systemctl', ['restart', 'NetworkManager']);
		return {
			success: true,
			message: 'Перезапуск сети завершен',
		};
	} catch (e) {
		return {
			success: false,
			message: e.message,
		};
	}
}
module.exports = reload_net;
