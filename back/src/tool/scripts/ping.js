const { execFile } = require('child_process');

const IPV4 =
	/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const HOST =
	/^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Валидация адреса (IPv4 или домен) для безопасной передачи в ping без shell
function isValidHost(host) {
	if (typeof host !== 'string') return false;
	const h = host.trim();
	if (!h || h.length > 253 || h.startsWith('-')) return false;
	return IPV4.test(h) || HOST.test(h);
}

// Проверка доступности одного адреса
function pingOne(host) {
	return new Promise((resolve) => {
		if (process.platform !== 'linux')
			return resolve({
				host,
				success: false,
				message: 'Не на Linux системе',
			});
		if (!isValidHost(host))
			return resolve({ host, success: false, message: 'Некорректный адрес' });
		// Без shell: аргументы передаём массивом
		execFile(
			'ping',
			['-c', '1', '-W', '1', host],
			{ encoding: 'utf8', timeout: 3000 },
			(error, stdout) => {
				const m = /time[=<]([\d.]+)\s*ms/.exec(stdout || '');
				const time = m ? Number(m[1]) : null;
				if (error)
					return resolve({
						host,
						success: false,
						time: null,
						message: 'Недоступен',
					});
				resolve({ host, success: true, time });
			},
		);
	});
}

// Проверка списка адресов (дедупликация, ограничение количества)
function ping(hosts) {
	const list = Array.isArray(hosts) ? hosts : [hosts];
	const unique = [...new Set(list.filter((el) => typeof el === 'string'))].slice(
		0,
		100,
	);
	return Promise.all(unique.map((el) => pingOne(el.trim())));
}

module.exports = { ping, pingOne, isValidHost };
