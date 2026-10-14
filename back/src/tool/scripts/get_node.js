const fs = require('fs');
const path = require('path');
const os = require('os');

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
			console.error(
				`Ошибка при чтении версий Node.js (${nvmNodeDir}):`,
				error.message,
			);
		}
	}

	// Fallback на директорию текущего node процесса
	return path.dirname(process.execPath);
}

module.exports = getLatestNodePath;
