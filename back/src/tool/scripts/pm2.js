const { exec } = require('child_process');
// const { getSecureAccessKey } = require('../security');

// Выполнение команд для pm2
function pm2(code, type = 'all') {
	return new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				// Используем полный путь к node и pm2, поскольку они установлены в nvm для root
				// const command = `echo "${getSecureAccessKey()}" | sudo -S /root/.nvm/versions/node/v22.17.0/bin/node /root/.nvm/versions/node/v22.17.0/bin/pm2 ${code} all`;
				// const command = `sudo -S /root/.nvm/versions/node/v22.17.0/bin/node /root/.nvm/versions/node/v22.17.0/bin/pm2 ${code} all`;
				const command = `pm2 ${code} ${type}`;

				exec(command, (error, stdout, stderr) => {
					if (error) {
						console.error(
							`Ошибка 1 при выполнении pm2 ${code}: ${error.message}`
						);
						return;
					}
					if (stderr) {
						console.error(`stderr: ${stderr}`);
						return;
					}
					exec('pm2 save', (error, stdout, stderr) => {
						if (error) {
							console.error(
								`Ошибка 2 при выполнении pm2 ${code}: ${error.message}`
							);
							return;
						}
						console.log(`stdout: ${stdout}`);
					});
				});
			}, 5000);
			resolve({
				success: true,
				message: `code: ${code} всех процессов pm2 через 5 секунд...`,
			});
		} catch (error) {
			console.error(
				`Ошибка при выполнении pm2 ${code}: ${error.message}`
			);
			reject({ success: false, error: error.message });
		}
	});
}

module.exports = pm2;
