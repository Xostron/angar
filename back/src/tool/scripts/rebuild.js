const path = require('path');
const { getSu, execProm } = require('./fn');
const getLatestNodePath = require('./get_node.js');

function rebuild() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') {
			return reject({
				success: false,
				message: 'Не на Linux системе',
			});
		}

		const home = process.env.HOME || os.homedir() || '';
		// На Linux Mint/Ubuntu nvm обычно у пользователя (~/.nvm), на серверах — у root (/root/.nvm)
		const candidates = [];
		if (home) candidates.push(path.join(home, '.nvm', 'versions', 'node'));
		candidates.push('/root/.nvm/versions/node');
		// Выполняем команды от имени tenta с использованием пароля
		const nodePath = getLatestNodePath();
		const su = `echo "${getSu()}" | sudo -S bash -c 'export PATH=${nodePath}:$PATH`;

		const cmdBack = `${su} && cd /home/tenta/apps/back && npm install'`;
		const cmdFront = `${su} && cd /home/tenta/apps/front && npm install && npm run build' && pkill chromium || true`;
		const cmdPM2 = [
			'nohup bash -c "pm2 start /home/tenta/apps/ecosystem/ecosystem.config.js  && pm2 save" > /dev/null 2>&1 &',
		].join(' && ');
		//
		resolve();
		execProm(cmdBack, 'Подготовка Back')
			.then((_) => execProm(cmdFront, 'Подготовка Front'))
			.then((_) => execProm(cmdPM2, 'PM 2'))
			.then()
			.catch(reject);
	});
}

module.exports = rebuild;
