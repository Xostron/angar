const { execSync } = require('child_process');

// получение сетевой информации
function get_net_info() {
	return new Promise((resolve, reject) => {
		try {
			// Получаем вывод команды ip -j addr (json формат)
			const output = execSync('ip -j addr', { encoding: 'utf8' });
			const data = JSON.parse(output);

			const net = data
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
						state: iface.operstate,
					};
				});
			// Получаем список ttyS из dmesg
			let ttyS = [];
			try {
				const dmesgOutput = execSync('dmesg | grep -i ttyS', {
					encoding: 'utf8',
				});
				// Пример строки:
				// [    4.928209] dw-apb-uart.8: ttyS4 at MMIO 0x9122a000 (irq = 4, base_baud = 115200) is a 16550A
				const lines = dmesgOutput.split('\n').filter(Boolean);
				ttyS = lines
					.filter((line) => !line.includes('dw-apb-uart')) // Исключаем dw-apb-uart
					.map((line) => {
						// Извлекаем все данные из строки dmesg
						const regex =
							/(?<driver>\S+): (?<tty>ttyS\d+) at (?<type>I\/O|MMIO) (?<addr>0x[0-9a-fA-F]+) \(irq = (?<irq>\d+), base_baud = (?<baud>\d+)\) is a (?<chipset>\S+)/;
						const match = line.match(regex);
						if (match && match.groups) {
							return {
								driver: match.groups.driver,
								tty: match.groups.tty,
								type: match.groups.type,
								addr: match.groups.addr,
								irq: parseInt(match.groups.irq, 10),
								base_baud: parseInt(match.groups.baud, 10),
								chipset: match.groups.chipset,
								raw: line,
							};
						} else {
							// Если не совпало с основным шаблоном, просто вернем строку
							return { raw: line };
						}
					})
					.filter(Boolean);
			} catch (e) {
				console.warn('Ошибка при получении ttyS из dmesg:', e.message);
				// Не прерываем выполнение, просто оставляем ttyS пустым
			}

			const result = { net, ttyS };
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
