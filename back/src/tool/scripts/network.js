const { exec } = require('child_process');

// список доступных wifi точек доступа
function wifi_list() {
	return new Promise((resolve, reject) => {
		try {
			console.log('step 1: list wifi start');
			const result = execSync('nmcli device wifi list');
			console.log('step 2: list wifi result', result);
			resolve(result);
		} catch (e) {
			console.log('step 3: list wifi error`', e);
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
			resolve(result);
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
			get_net_info()
				.then(resolve)
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
