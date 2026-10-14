const { exec } = require('child_process');
const { getSu } = require('./fn');
const getLatestNodePath = require('./get_node.js');

// сборка фронта и бэка
const frontCommands = [
	'cd /home/tenta/apps/front',
	'npm install',
	'npm run build',
].join(' && ');

const backCommands = [
	'cd /home/tenta/apps/back',
	'npm install',
	'pm2 restart /home/tenta/apps/ecosystem/ecosystem.config.js',
	'pm2 save',
].join(' && ');

const fullCommand = `${frontCommands} && ${backCommands}`;

// Выполняем команды от имени tenta с использованием пароля
const nodePath = getLatestNodePath();

function rebuild() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return reject({
				success: false,
				message: 'Не на Linux системе',
			});
		}
		exec(
			`echo "${getSu()}" |  sudo -S bash -c 'export PATH=${nodePath}:$PATH && ${fullCommand}'`,
			// `bash -c 'export PATH=${nodePath}:$PATH && ${fullCommand}'`,
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
				}
				resolve({ stdout, stderr });
			},
		);
	});
}

module.exports = rebuild;
