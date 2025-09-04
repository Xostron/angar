const { exec } = require('child_process');

// включение/выключение автологина
function auto_login(flag = true) {
	return new Promise((resolve, reject) => {
		const cmd = `astra-autologin-control ${
			flag ? 'enable' : 'disable'
		} angar`;
		// const cmd = `echo "${getSecureAccessKey()}" | sudo -S astra-autologin-control ${
		// 	flag ? 'enable' : 'disable'
		// } angar`;
		exec(cmd, (error, stdout, stderr) => {
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
			console.log('auto_login', stdout);
			resolve(stdout);
		});
	});
}

module.exports = auto_login;
