const { exec } = require('child_process');

// список доступных wifi точек доступа
function wifi_list() {
	exec('nmcli device wifi list', (error, stdout, stderr) => {
		if (error) {
			console.error(
				`Ошибка при выполнении nmcli device wifi list: ${error.message}`
			);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		console.log(stdout);
	});
}

// подключение к wifi точке доступа по ssid и паролю
function wifi_connect(ssid, password) {
	exec(
		`nmcli device wifi connect ${ssid} password ${password}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(
					`Ошибка при выполнении nmcli device wifi connect: ${error.message}`
				);
				return;
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return;
			}
			console.log(stdout);
		}
	);
}

module.exports = {
	wifi_list,
	wifi_connect,
};
