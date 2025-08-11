const { exec } = require('child_process');
const { getSecureAccessKey } = require('../security');

// сборка фронта и бэка
const frontCommands = [
	'cd /home/tenta/apps/front',
	'npm install',
	'npm run build',
].join(' && ');

const backCommands = ['cd /home/tenta/apps/back', 'npm install'].join(' && ');

const fullCommand = `${frontCommands} && ${backCommands}`;
// Выполняем команды от имени tenta с использованием пароля
const nodePath = '/root/.nvm/versions/node/v22.17.0/bin';
function rebuild() {
	return new Promise((resolve, reject) => {
		exec(
			`echo "${getSecureAccessKey()}" |  sudo -S bash -c 'export PATH=${nodePath}:$PATH && ${fullCommand}'`,
			// `bash -c 'export PATH=${nodePath}:$PATH && ${fullCommand}'`,
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
				}
				resolve({ stdout, stderr });
			}
		);
	});
}

module.exports = rebuild;
