const { execSync } = require('child_process');
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

			obj.bssid = el[0];
			obj.ssid = el[1];
			obj.signal = el[5];
			return obj;
		})
		.filter((el) => el.ssid !== '--');
	return lines;
}

// список доступных wifi точек доступа
function wifi_list() {
	return new Promise((resolve, reject) => {
		try {
			console.log('step 1: list wifi start');
			const result = execSync('nmcli device wifi list');
			console.log('step 2: list wifi result', result);
			// Convert Buffer to string
			const wifiListString = result.toString('utf8');
			console.log('step 3: list wifi result:', wifiListString);

			// Parse the text output to JSON
			const list = parseWifiList(wifiListString);
			console.log('step 4: list wifi result:', list);
			resolve(list);
		} catch (e) {
			console.log('step 0: list wifi error', e);
			reject(e);
		}
	});
}

// подключение к wifi точке доступа по ssid и паролю
function wifi_connect(bssid, ssid, password) {
	return new Promise((resolve, reject) => {
		try {
			// Экранируем кавычки в SSID для безопасности
			const escapedSsid = ssid.replace(/"/g, '\\"');
			console.log('step 1: connect wifi', ssid, password);
			const result = execSync(
				`nmcli device wifi connect ${
					bssid || escapedSsid
				} password ${password}`
				// { encoding: 'utf8' }
			);
			console.log('step 2: connect wifi', ssid, password, result);

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
			console.log('step 3: connect wifi error', ssid, password, e);
			const errorMessage = e.stdout
				? e.stdout.toString('utf8')
				: e.stderr
				? e.stderr.toString('utf8')
				: e.toString();
			reject({ success: false, message: errorMessage });
		}
	});
}

// переключение wifi точек доступа на включение или выключение
function switching(type = 'wifi', state = 'on') {
	return new Promise((resolve, reject) => {
		try {
			console.log(
				'step 1: Turn on or off in NetworkManager start',
				type,
				state
			);
			const result = execSync(`nmcli device ${type} ${state}`);
			console.log(
				'step 2: Turn on or off in NetworkManager result',
				type,
				state,
				result
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
					console.log(
						'step 3: Turn on or off in NetworkManager finish',
						type,
						state
					);
				});
		} catch (e) {
			console.log(
				'step 4: Turn on or off in NetworkManager error`',
				type,
				state,
				e
			);
			reject(e);
		}
	});
}

module.exports = {
	wifi_list,
	wifi_connect,
	switching,
};
