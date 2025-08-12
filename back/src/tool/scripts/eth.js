const { execSync } = require('child_process');

function info() {
	return new Promise((resolve, reject) => {
		try {
			const result = execSync('nmcli device status');
			resolve(result);
		} catch (e) {
			reject(e);
		}
	});
}

function manager(data) {
	return new Promise((resolve, reject) => {
		try {
			const result = execSync(
				'nmcli device set eth0 ipv4.method manual ipv4.addresses 192.168.1.100/24'
			);
			resolve(result);
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = {
	info,
	manager,
};
