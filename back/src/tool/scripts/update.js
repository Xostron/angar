const { exec } = require('child_process');
const { getSecureAccessKey } = require('../security');

function update() {
	// обновление кода через git от имени пользователя tenta
	console.log('Обновление кода через git от имени пользователя tenta...');

	const commands = [
		'cd /home/tenta/apps',
		'git config --global --add safe.directory /home/tenta/apps',
		'git restore .',
		// 'git clean -f',
		'git pull',
	];

	// Объединяем команды в одну строку через &&
	const fullCommand = commands.join(' && ');

	// Выполняем команды от имени tenta с использованием пароля
	exec(
		// `echo "${getSecureAccessKey()}" |  sudo -S bash -c '${fullCommand}'`,
		`${fullCommand}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`Ошибка при обновлении кода: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
			}
			console.log(`stdout: ${stdout}`);
		}
	);
}

module.exports = update;
