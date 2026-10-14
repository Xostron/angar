const { suExecFile } = require('./fn');

// перезагрузка системы
function shutdown() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return reject({
				success: false,
				message: 'Не на Linux системе',
			});
		}
		const message = 'Выключение системы через 5 секунд...';
		setTimeout(() => {
			suExecFile('systemctl', ['poweroff'])
				.then(() => {
					console.log('Выключение системы запущено');
				})
				.catch((error) => {
					console.error(
						`Ошибка при выполнении выключения: ${error.message}`,
					);
				});
		}, 5000);
		resolve({ success: true, message });
	});
}

module.exports = shutdown;
