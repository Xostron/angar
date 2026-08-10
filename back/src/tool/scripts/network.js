const { execSync, execFileSync } = require('child_process');
const get_net_info = require('./get_net_info');

// парсинг текстового вывода nmcli в JSON
function parseWifiList(str) {
	let lines = str.trim().split('\n');
	delete lines[0];
	lines = lines
		.map((el) => {
			el = el.split('  ').filter((el) => el);
			const obj = {};
			if (el[0].includes('*')) {
				obj.current = true;
				el.shift();
			}

			obj.bssid = el[0]?.trim();
			obj.ssid = el[1]?.trim();
			obj.signal = el[5]?.trim();
			return obj;
		})
		.filter((el) => el.ssid !== '--');
	return lines;
}

// список доступных wifi точек доступа
function wifi_list() {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// Состояние WiFi радио (enabled/disabled) — авторитетный источник
			let radio = null;
			try {
				radio = execFileSync('nmcli', ['radio', 'wifi'], {
					encoding: 'utf8',
				}).trim();
			} catch (e) {
				radio = null;
			}
			// Список сетей: может быть пустым, если радио выключено
			let list = [];
			try {
				// console.log('step 1: list wifi start');
				const result = execSync('nmcli device wifi list');
				// console.log('step 2: list wifi result', result);
				// Convert Buffer to string
				const wifiListString = result.toString('utf8');
				// console.log('step 3: list wifi result:', wifiListString);

				// Parse the text output to JSON
				list = parseWifiList(wifiListString);
				// console.log('step 4: list wifi result:', list);
			} catch (e) {
				// console.log('step 0: list wifi error', e);
			}
			resolve({ list, radio });
		} catch (e) {
			reject(e);
		}
	});
}

// подключение к wifi точке доступа по ssid и паролю
function wifi_connect(bssid, ssid, password) {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// Без shell: аргументы передаём массивом, пароль не интерпретируется
			const result = execFileSync(
				'nmcli',
				['device', 'wifi', 'connect', bssid || ssid, 'password', password],
				{ encoding: 'utf8' }
			);
			// console.log('step 2: connect wifi', ssid, password, result);

			// Проверяем результат на наличие ошибок в сообщении
			const hasError =
				result.includes('Ошибка') ||
				result.includes('Error') ||
				result.includes('failed') ||
				result.includes('сбой');

			if (hasError) {
				resolve({ success: false, message: result });
			} else {
				resolve({ success: true, message: result });
			}
		} catch (e) {
			// console.log('step 3: connect wifi error', ssid, password, e);
			const errorMessage = e.stdout
				? e.stdout.toString('utf8')
				: e.stderr
				? e.stderr.toString('utf8')
				: e.toString();
			reject({ success: false, message: errorMessage });
		}
	});
}

function disconnect_wifi() {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// console.log('step 1: disconnect wifi - finding wifi interface');
			// Находим имя WiFi интерфейса
			const interfaceResult = execSync(
				'nmcli -t -f DEVICE,TYPE device | grep wifi | cut -d: -f1'
			);
			const wifiInterface = interfaceResult.toString().trim();

			if (!wifiInterface) {
				throw new Error('WiFi интерфейс не найден');
			}

			// console.log('step 2: disconnect wifi interface', wifiInterface);
			// Используем 2>&1 для объединения stdout и stderr, и || true чтобы игнорировать ошибки
			const result = execSync(
				`nmcli device disconnect ${wifiInterface} 2>&1 || true`
			);
			const output = result.toString();
			// console.log('step 3: disconnect wifi result', output);

			// Проверяем успешность по наличию "Выполнено" или "successfully" в выводе
			const isSuccess =
				output.includes('Выполнено') ||
				output.includes('successfully') ||
				output.includes('disconnected');

			if (isSuccess) {
				resolve({
					success: true,
					message: 'WiFi успешно отключен',
					interface: wifiInterface,
				});
			} else {
				throw new Error(output || 'Не удалось отключить WiFi');
			}
		} catch (e) {
			// console.log('step 4: disconnect wifi error', e);
			const errorMessage = e.message || e.toString();
			reject({ success: false, message: errorMessage });
		}
	});
}

// переключение wifi радио включение или выключение
function switching(type = 'wifi', state = 'on') {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// nmcli device wifi on|off — невалидно; используем nmcli radio wifi on|off
			const validTypes = ['wifi', 'wwan'];
			const validStates = ['on', 'off'];
			if (!validTypes.includes(type) || !validStates.includes(state)) {
				return reject({
					success: false,
					message: 'Некорректные параметры switching',
				});
			}
			// console.log(
			// 	'step 1: Turn on or off in NetworkManager start',
			// 	type,
			// 	state
			// );
			const result = execFileSync(
				'nmcli',
				['radio', type, state],
				{ encoding: 'utf8' }
			);
			// Get updated network info after switching
			get_net_info()
				.then((netInfo) => {
					resolve({
						success: true,
						type,
						state,
						message: result.toString('utf8'),
						network_info: netInfo,
					});
				})
				.catch(reject)
				.finally(() => {
					// console.log(
					// 	'step 3: Turn on or off in NetworkManager finish',
					// 	type,
					// 	state
					// );
				});
		} catch (e) {
			// console.log(
			// 	'step 4: Turn on or off in NetworkManager error`',
			// 	type,
			// 	state,
			// 	e
			// );
			reject(e);
		}
	});
}

module.exports = {
	wifi_list,
	wifi_connect,
	switching,
	disconnect_wifi,
};
