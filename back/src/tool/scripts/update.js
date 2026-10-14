const { execSync } = require('child_process');
const { getSu } = require('./fn');
const getLatestNodePath = require('./get_node.js');

function update() {
	return new Promise((resolve, reject) => {
		// обновление кода через git от имени пользователя tenta
		// console.log('Обновление кода через git от имени пользователя tenta...');
		if (process.platform !== 'linux') return;
		const home = process.env.HOME || os.homedir() || '';
		// На Linux Mint/Ubuntu nvm обычно у пользователя (~/.nvm), на серверах — у root (/root/.nvm)
		const candidates = [];
		if (home) candidates.push(path.join(home, '.nvm', 'versions', 'node'));
		candidates.push('/root/.nvm/versions/node');
		// Выполняем команды от имени tenta с использованием пароля
		const nodePath = getLatestNodePath();
		const su = `echo "${getSu()}" |  sudo -S bash -c 'export PATH=${nodePath}:$PATH`;

		const cmdGit = [
			'cd /home/tenta/apps',
			'git config --global --add safe.directory /home/tenta/apps',
			'git restore .',
			// 'git clean -fdX',
			'git pull',
		];

		const cmdBack = [su, 'cd /home/tenta/apps/back', 'npm install'];

		const cmdFront = [
			su,
			'cd /home/tenta/apps/back',
			'npm install',
			'npm run build',
			'pkill -f chromium',
		];

		const cmdPM2 = [
			'pm2 start /home/tenta/apps/ecosystem/ecosystem.config.js',
			'pm2 save',
		];
		execProm(cmdGit, 'Обновление git')
			.then((_) => execProm(cmdBack, 'Подготовка Back'))
			.then((_) => execProm(cmdFront, 'Подготовка Front'))
			.then((_) => execProm(cmdPM2, 'PM 2'))
			.then((_) => resolve())
			.catch(reject);
		// apps/back/
		// npm install
		// cd ../../
		// pm2 start apps/ecosystem/ecosystem.config.js
		// pm2 save
		// cd apps/front/
		// npm install
		// npm run build
		// pkill -f chromium
	});
}

function execProm(cmd, str) {
	return new Promise((resolve, reject) => {
		try {
			console.log(new Date().toLocaleString('ru-RU'), 'Запуск', str);
			execSync(cmd);
			console.log(new Date().toLocaleString('ru-RU'), 'Завершено', str);
			resolve();
		} catch (error) {
			console.error('Ошибка', str, error);
			reject(str, error.toString());
		}
	});
}

module.exports = update;
