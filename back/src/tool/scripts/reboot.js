const { suExecFile } = require('./fn');

// перезагрузка системы
function reboot() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return reject({
				success: false,
				message: 'Не на Linux системе',
			});
		}
		const message = 'Перезапуск системы через 5 секунд...';
		setTimeout(() => {
			suExecFile('systemctl', ['reboot'])
				.then(() => {
					console.log('Перезагрузка системы запущена');
				})
				.catch((error) => {
					console.error(
						`Ошибка при выполнении перезагрузки: ${error.message}`
					);
				});
		}, 5000);
		resolve({ success: true, message });
	});
}

module.exports = reboot;
