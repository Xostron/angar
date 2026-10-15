const { execProm } = require('./fn');

// Разрешённые команды pm2
const CONF_CODES = ['start', 'stop', 'restart', 'reload', 'delete'];
const ALLOWED_CODES = ['save', 'flush', 'status', 'list'];

// Выполнение команд для pm2
function pm2(code, type = 'all') {
	return new Promise((resolve, reject) => {
		if (![...ALLOWED_CODES, ...CONF_CODES].includes(code)) {
			return reject({
				success: false,
				error: `Недопустимая команда pm2: ${code}`,
			});
		}

		let cmd = [
			'pm2',
			code,
			'/home/tenta/apps/ecosystem/ecosystem.config.js',
			'&& pm2 save',
		].join(' ');
		if (code === 'save') cmd = 'pm2 save';
		else if (CONF_CODES.includes(code))
			cmd = [
				'nohup bash -c "pm2',
				code,
				'/home/tenta/apps/ecosystem/ecosystem.config.js && pm2 save" > /dev/null 2>&1 &',
			].join(' ');
		return execProm(cmd, 'PM 2 ' + code);
	});
}

module.exports = pm2;
