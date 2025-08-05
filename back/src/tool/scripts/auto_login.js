const { exec } = require('child_process');
const { getSecureAccessKey } = require('../security');

// включение/выключение автологина
function auto_login(flag = true) {
	return new Promise((resolve, reject) => {
		exec(
			`echo "${getSecureAccessKey()}" | sudo -S astra-autologin-control ${
				flag ? 'enable' : 'disable'
			} user`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(
						`Ошибка при выполнении astra-autologin-control: ${error.message}`
					);
					reject(error);
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
					reject(stderr);
				}
				console.log(stdout);
				resolve(stdout);
			}
		);
	});
}

auto_login(true);
