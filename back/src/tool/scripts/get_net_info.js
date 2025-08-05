const { execSync } = require('child_process');

// получение сетевой информации
function get_net_info() {
	return new Promise((resolve, reject) => {
		try {
			// Получаем вывод команды ip -j addr (json формат)
			const output = execSync('ip -j addr', { encoding: 'utf8' });
			const data = JSON.parse(output);

			const result = data
				.filter((iface) => iface.ifname !== 'lo') // пропускаем loopback
				.map((iface) => {
					// Ищем первый inet-адрес (IPv4)
					const inet = (iface.addr_info || []).find(
						(a) => a.family === 'inet'
					);
					return {
						interface: iface.ifname,
						mac: iface.address || null,
						ip: inet ? inet.local : null,
					};
				});
			console.log('get_net_info result', result);
			resolve(result);
		} catch (e) {
			console.error(
				'Ошибка при получении сетевой информации:',
				e.message
			);
			reject(e);
		}
	});
}

module.exports = get_net_info;
