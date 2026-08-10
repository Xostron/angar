const { execFile } = require('child_process');

// Разрешённые команды pm2
const ALLOWED_CODES = [
	'save',
	'restart',
	'flush',
	'start',
	'stop',
	'reload',
	'delete',
	'status',
	'list',
];

// Выполнение команд для pm2
function pm2(code, type = 'all') {
	return new Promise((resolve, reject) => {
		if (!ALLOWED_CODES.includes(code)) {
			return reject({
				success: false,
				error: `Недопустимая команда pm2: ${code}`,
			});
		}
		try {
			setTimeout(() => {
				// Без shell: бинарник и аргументы передаём массивом
				const args =
					code === 'save'
						? ['save']
						: [code, '/home/tenta/apps/ecosystem/ecosystem.config.js'];

				execFile('pm2', args, (error, stdout, stderr) => {
					if (error) {
						console.error(
							`Ошибка при выполнении pm2 ${code}: ${error.message}`
						);
						return;
					}
					if (stderr) {
						console.error(`stderr: ${stderr}`);
					}
					console.log(`pm2 ${code}`, stdout);
				});
			}, 5000);
			resolve({
				success: true,
				message: `code: ${code} всех процессов pm2 через 5 секунд...`,
			});
		} catch (error) {
			reject({ success: false, error: error.message });
		}
	});
}

module.exports = pm2;
