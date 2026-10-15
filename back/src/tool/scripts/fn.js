const { execFileSync, execFile, exec } = require('child_process');

function getSu() {
	const p = process.env.SU;
	if (!p) throw Error('Не указан SU');
	return p
		.split('')
		.filter((e, i) => !(i % 2))
		.reverse()
		.join('');
}

// Выполнение команды от имени root через sudo -S (пароль из SU, без shell)
// options.input — содержимое, передаваемое в stdin команды после строки пароля
function suExecFileSync(bin, args, options = {}) {
	const password = getSu();
	const input = (password ? password + '\n' : '') + (options.input || '');
	return execFileSync('sudo', ['-S', bin, ...args], {
		...options,
		encoding: options.encoding || 'utf8',
		input,
	});
}

// Асинхронная версия: spawn'им execFile с sudo -S
function suExecFile(bin, args, options = {}) {
	return new Promise((resolve, reject) => {
		const { input: extraInput, ...rest } = options;
		const password = getSu();
		const input = (password ? password + '\n' : '') + (extraInput || '');
		const child = execFile(
			'sudo',
			['-S', bin, ...args],
			{ ...rest, encoding: rest.encoding || 'utf8' },
			(error, stdout, stderr) => {
				if (error) return reject(error);
				resolve({ stdout, stderr });
			},
		);
		// Передаём данные в stdin вручную (async execFile не поддерживает option.input)
		child.stdin.end(input);
	});
}

// Асинхронное выполнение shell-команды (не блокирует event loop)
function execProm(cmd, str) {
	return new Promise((resolve, reject) => {
		console.log('execProm: ', cmd);
		console.log('Запуск', str);
		exec(
			cmd,
			{ encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
			(error, stdout, stderr) => {
				if (stdout) console.log(String(stdout).trimEnd());
				if (stderr) console.log(String(stderr).trimEnd());
				if (error) {
					console.error('Ошибка', str, error);
					return reject(error);
				}
				console.log('Завершено', str);
				resolve();
			},
		);
	});
}

module.exports = { getSu, suExecFileSync, suExecFile, execProm };
