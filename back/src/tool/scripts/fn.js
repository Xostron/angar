const { execFileSync, execFile } = require('child_process');

function getSu() {
	const p = process.env.SU;
	return !p
		? null
		: p
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
		const password = getSu();
		const input = (password ? password + '\n' : '') + (options.input || '');
		execFile(
			'sudo',
			['-S', bin, ...args],
			{
				...options,
				encoding: options.encoding || 'utf8',
				input,
			},
			(error, stdout, stderr) => {
				if (error) return reject(error);
				resolve({ stdout, stderr });
			}
		);
	});
}

module.exports = { getSu, suExecFileSync, suExecFile };
