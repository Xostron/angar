const { readFileSync } = require('fs');
const { execSync } = require('child_process');

// Функции для получения информации о батарее
function battery() {
	let level = null;
	try {
		// Проверяем доступна ли команда acpi
		const acpiOut = execSync('acpi -b', { encoding: 'utf8' }).trim();
		if (acpiOut && acpiOut.length > 0) {
			const match = acpiOut.match(/(\d+)%/);
			if (match) level = parseInt(match[1], 10);
		}
	} catch (e) {
		console.error('\x1b[33m%s\x1b[0m acpi -b', e.message);
		level = e.message;
	}
	console.log('Battery:', level);
	return level;
}

function os() {
	let s = null;
	try {
		// Удаляем escape-последовательности типа \n \l \r и т.д.
		s = readFileSync('/etc/issue', 'utf8')
			.replace(/\\[a-z]/g, '')
			.trim();
	} catch (e) {
		console.error('\x1b[33m%s\x1b[0m /etc/issue', e.message);
		s = e.message;
	}
	console.log('OS:', s);
	return s;
}

// Функции для получения информации о CPU
function cpu(obj) {
	let s = null;
	try {
		s = execSync('lscpu | grep "Имя модели:" | cut -d: -f2 | xargs', {
			encoding: 'utf8',
		}).trim();
	} catch (e) {
		console.error('\x1b[33m%s\x1b[0m lscpu', e.message);
		s = e.message;
	}
	console.log('CPU:', s);
	return s;
}

// Функции для получения информации о MongoDB
function db() {
	const obj = {
		status: null,
		version: null,
	};
	try {
		obj.status = execSync(
			'systemctl is-active mongod 2>/dev/null',
			{ encoding: 'utf8' },
		).trim();
		obj.version = execSync(
			'dpkg -l | grep -E "mongodb-org-server|mongodb-server" | awk \'{print $3}\' | head -1',
			{ encoding: 'utf8' },
		).trim();
	} catch (e) {
		console.error('\x1b[33m%s\x1b[0m systemctl status mongod', e.message);
		obj.error = e.message;
	}
	console.log('MongoDB:', obj.status, obj.version);
	return obj;
}

module.exports = {
	battery,
	os,
	cpu,
	db,
};
