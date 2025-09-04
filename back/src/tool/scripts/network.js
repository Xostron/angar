const { execSync } = require('child_process');
const get_net_info = require('./get_net_info');

// парсинг текстового вывода nmcli в JSON
function parseWifiList(str) {
	const lines = str.trim().split('\n');
	if (lines.length < 2) return [];
	delete lines[0];
	const list = [];
	lines.forEach((line) => {
		let a = line.split(' ');
		const current = a.startsWith('*') ? true : false;
		a = a.filter((el) => !['', '*'].includes(el));
		console.log(a);
		const o = {
			ssid: a[1],
			signal: a[6],
			current,
		};
		if (o.ssid !== '--') list.push(o);
	});
	return list;
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
function wifi_connect(ssid, password) {
	return new Promise((resolve, reject) => {
		try {
			console.log('step 1: connect wifi', ssid, password);
			const result = execSync(
				`nmcli device wifi connect ${ssid} password ${password}`
			);
			console.log('step 2: connect wifi', ssid, password, result);
			// Convert Buffer to string and return as object
			const connectResult = result.toString('utf8');
			resolve({ success: true, message: connectResult });
		} catch (e) {
			console.log('step 3: connect wifi error`', ssid, password, e);
			reject(e);
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
