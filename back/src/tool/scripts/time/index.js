const { execFileSync } = require('child_process');
const { suExecFile } = require('../fn');

const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
// Кэш имени системной зоны (рама оборудования собирается часто — не дёргаем timedatectl каждый раз)
const ZONE_CACHE_MS = 3000;
let zoneCache = { name: null, ts: 0 };

/**
 * Имя часового пояса системы (например, Europe/Astrakhan).
 * timedatectl, если доступен, иначе — зона процесса Node.
 * @returns {string}
 */
function systemZone() {
	const now = Date.now();
	if (zoneCache.name && now - zoneCache.ts < ZONE_CACHE_MS)
		return zoneCache.name;
	let zone = null;
	if (process.platform === 'linux') {
		try {
			zone = execFileSync(
				'timedatectl',
				['show', '-p', 'Timezone', '--value'],
				{ encoding: 'utf8' },
			).trim();
		} catch (e) {
			zone = null;
		}
	}
	if (!zone) zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	zoneCache = { name: zone, ts: now };
	return zone;
}

/**
 * Смещение зоны относительно UTC в минутах.
 * Считается по имени зоны, поэтому не зависит от зоны процесса Node
 * (после смены пояса процесс продолжает работать в старой зоне).
 * @param {string} [zone] Имя зоны (по умолчанию — зона системы)
 * @returns {number} Как Date#getTimezoneOffset: UTC+4 -> -240
 */
function zoneOffsetMin(zone) {
	const name = zone || systemZone();
	try {
		const dtf = new Intl.DateTimeFormat('en-US', {
			timeZone: name,
			hourCycle: 'h23',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
		const now = new Date();
		const parts = {};
		dtf.formatToParts(now).forEach((el) => {
			if (el.type !== 'literal') parts[el.type] = el.value;
		});
		// «Настенное» время зоны, прочитанное как UTC
		const wall = Date.UTC(
			+parts.year,
			+parts.month - 1,
			+parts.day,
			+parts.hour,
			+parts.minute,
			+parts.second,
		);
		// Знак обратный getTimezoneOffset
		return Math.round((now.getTime() - wall) / 60000);
	} catch (e) {
		return new Date().getTimezoneOffset();
	}
}

/**
 * Список доступных часовых поясов
 * @returns {Promise<string[]>}
 */
function zones() {
	return new Promise((resolve) => {
		if (process.platform === 'linux') {
			try {
				const out = execFileSync('timedatectl', ['list-timezones'], {
					encoding: 'utf8',
					maxBuffer: 1024 * 1024,
				});
				const list = out
					.split('\n')
					.map((el) => el.trim())
					.filter(Boolean);
				if (list.length) return resolve(list);
			} catch (e) {
				// timedatectl недоступен — берём список из ICU
			}
		}
		try {
			if (typeof Intl.supportedValuesOf === 'function')
				return resolve(Intl.supportedValuesOf('timeZone'));
		} catch (e) {
			// нет поддержки — вернём пустой список
		}
		resolve([]);
	});
}

/**
 * Установка часового пояса
 * @param {string} zone Имя зоны (Europe/Astrakhan)
 * @returns {Promise<{zone: string, offset: number}>}
 */
async function setZone(zone) {
	if (process.platform !== 'linux') {
		throw new Error('Not a Linux system');
	}
	if (typeof zone !== 'string' || !/^[A-Za-z0-9_+\-/]+$/.test(zone.trim())) {
		throw new Error('Некорректное имя часового пояса');
	}
	const name = zone.trim();
	// Ставим только зоны из системного списка
	const list = await zones();
	if (list.length && !list.includes(name)) {
		throw new Error(`Неизвестный часовой пояс: ${name}`);
	}
	await suExecFile('timedatectl', ['set-timezone', name]);
	// Сразу сбрасываем кэш — рама должна отдать новую зону
	zoneCache = { name, ts: Date.now() };
	return { zone: name, offset: zoneOffsetMin(name) };
}

// Синхронизация времени (ntpdate в Linux Mint не установлен, используем systemd-timesyncd)
async function sync() {
	if (process.platform !== 'linux') {
		throw new Error('Not a Linux system');
	}
	await suExecFile('timedatectl', ['set-ntp', 'true']);
	await suExecFile('systemctl', ['restart', 'systemd-timesyncd']);
	return 'Время синхронизировано через systemd-timesyncd';
}

// Установка времени
async function set(dt) {
	if (process.platform !== 'linux') {
		throw new Error('Not a Linux system');
	}
	if (typeof dt !== 'string' || !DATE_TIME_REGEX.test(dt.trim())) {
		throw new Error('Некорректный формат даты и времени');
	}
	// sudo timedatectl set-time 'YYYY-MM-DD HH:MM:SS'
	await suExecFile('timedatectl', ['set-time', dt.trim()]);
	return 'Время установлено';
}

module.exports = {
	sync,
	set,
	systemZone,
	zoneOffsetMin,
	zones,
	setZone,
};
