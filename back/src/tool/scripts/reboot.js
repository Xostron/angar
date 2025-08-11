const { exec } = require('child_process');
const { getSecureAccessKey } = require('../security');

// перезагрузка системы
function reboot() {
	setTimeout(() => {
		exec(
			// `echo "${getSecureAccessKey()}" | sudo -S reboot`,
			`reboot`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(
						`Ошибка при выполнении перезагрузки: ${error.message}`
					);
					return;
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
				}
				console.log(`stdout: ${stdout}`);
			}
		);
	}, 5000);
	return 'Перезапуск системы через 5 секунд...';
}

module.exports = reboot;
