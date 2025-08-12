const { execSync } = require('child_process');

function reload_net() {
	return new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				execSync('sudo systemctl restart NetworkManager');
			}, 5000);
			console.log('Служба NetworkManager успешно перезапущена.');
		} catch (e) {
			console.error('Ошибка при перезапуске NetworkManager:', e.message);
			reject(e);
		}
		resolve('Перезапуск сети через 5 секунд');
	});
}

module.exports = reload_net;
