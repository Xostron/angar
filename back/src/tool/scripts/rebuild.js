const { exec, execSync } = require('child_process');
const { getSecureAccessKey } = require('../security');
const fs = require('fs');
const path = require('path');

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

// Функция для получения самой свежей версии Node.js
function getLatestNodePath() {
	if (process.platform !== 'linux') return;
	const nvmNodeDir = '/root/.nvm/versions/node';

	try {
		// Читаем список директорий с версиями Node.js
		const versions = fs
			.readdirSync(nvmNodeDir)
			.filter((dir) => dir.startsWith('v'))
			.sort((a, b) => {
				// Извлекаем версии без префикса 'v'
				const versionA = a.slice(1).split('.').map(Number);
				const versionB = b.slice(1).split('.').map(Number);

				// Сравниваем major.minor.patch
				for (let i = 0; i < 3; i++) {
					if (versionA[i] !== versionB[i]) {
						return versionB[i] - versionA[i]; // Сортируем в обратном порядке (новые версии первыми)
					}
				}
				return 0;
			});

		if (versions.length > 0) {
			return path.join(nvmNodeDir, versions[0], 'bin');
		}
	} catch (error) {
		console.error('Ошибка при чтении версий Node.js:', error);
	}

	// Fallback на последнюю известную версию
	return '/root/.nvm/versions/node/v24.11.1/bin';
}

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
