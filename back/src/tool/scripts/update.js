const { execSync } = require('child_process');

function update() {
	return new Promise((resolve, reject) => {
		// обновление кода через git от имени пользователя tenta
		// console.log('Обновление кода через git от имени пользователя tenta...');

		const commands = [
			'cd /home/tenta/apps',
			'git config --global --add safe.directory /home/tenta/apps',
			'git restore .',
			// 'git clean -fdX',
			'git pull',
		];

		// Объединяем команды в одну строку через &&
		const fullCommand = commands.join(' && ');

		// Выполняем команды от имени tenta с использованием пароля
		try {
			const out = execSync(fullCommand);
			// console.log(out);
			resolve(true);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
}

module.exports = update;
