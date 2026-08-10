const { exec, execSync } = require('child_process');
const { getSu } = require('./fn');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

	const home = process.env.HOME || os.homedir() || '';
	// На Linux Mint/Ubuntu nvm обычно у пользователя (~/.nvm), на серверах — у root (/root/.nvm)
	const candidates = [];
	if (home) candidates.push(path.join(home, '.nvm', 'versions', 'node'));
	candidates.push('/root/.nvm/versions/node');

	for (const nvmNodeDir of candidates) {
		try {
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
							return versionB[i] - versionA[i]; // Сортировка в обратном порядке (новые версии первыми)
						}
					}
					return 0;
				});

			if (versions.length > 0) {
				return path.join(nvmNodeDir, versions[0], 'bin');
			}
		} catch (error) {
			console.error(`Ошибка при чтении версий Node.js (${nvmNodeDir}):`, error.message);
		}
	}

	// Fallback на директорию текущего node процесса
	return path.dirname(process.execPath);
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
