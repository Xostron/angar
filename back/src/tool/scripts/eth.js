const { execSync } = require('child_process');

function info() {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// Получаем имя ethernet-интерфейса (например, eth0 или enp3s0)
			const ifaceBuf = execSync(
				'nmcli -t -f DEVICE,TYPE device | grep ethernet | cut -d: -f1'
			);
			const iface = ifaceBuf.toString().trim();

			// Получаем режим (dhcp/manual)
			const methodBuf = execSync(
				`nmcli -g ipv4.method connection show "$(nmcli -g GENERAL.CONNECTION device show ${iface})"`
			);
			const method = methodBuf.toString().trim();

			// Получаем IP-адрес
			const ipBuf = execSync(`nmcli -g IP4.ADDRESS device show ${iface}`);
			const ip = ipBuf.toString().split('/')[0].trim();

			// Получаем маску подсети (CIDR -> маска)
			const cidr = ipBuf.toString().split('/')[1]?.trim();
			function cidrToMask(cidr) {
				if (!cidr) return '';
				const mask = [];
				let n = parseInt(cidr, 10);
				for (let i = 0; i < 4; i++) {
					const v =
						n >= 8 ? 255 : n > 0 ? 256 - Math.pow(2, 8 - n) : 0;
					mask.push(v);
					n -= 8;
					if (n < 0) n = 0;
				}
				return mask.join('.');
			}
			const mask = cidrToMask(cidr);

			// Получаем основной шлюз
			const gwBuf = execSync(`nmcli -g IP4.GATEWAY device show ${iface}`);
			const gateway = gwBuf.toString().trim();

			// Получаем DNS
			const dnsBuf = execSync(`nmcli -g IP4.DNS device show ${iface}`);
			const dns = dnsBuf
				.toString()
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean);

			resolve({
				iface,
				mode: method,
				ip,
				mask,
				gateway,
				dns,
			});
		} catch (e) {
			reject(e);
		}
	});
}

function manager(data) {
	return new Promise((resolve, reject) => {
		try {
			if (process.platform !== 'linux') {
				return reject({
					success: false,
					message: 'Не на Linux системе',
				});
			}
			// Получаем имя ethernet-интерфейса (например, eth0 или enp3s0)
			const ifaceBuf = execSync(
				'nmcli -t -f DEVICE,TYPE device | grep ethernet | cut -d: -f1'
			);
			const iface = ifaceBuf.toString().trim();

			// Получаем имя соединения для этого интерфейса
			const connectionNameBuf = execSync(
				`nmcli -g GENERAL.CONNECTION device show ${iface}`
			);
			const connectionName = connectionNameBuf.toString().trim();

			console.log(
				'Interface:',
				iface,
				'Connection name:',
				connectionName
			);

			const { mode, ip, mask, gateway, dns } = data;

			if (mode !== 'manual') {
				// Включить DHCP для интерфейса
				execSync(`nmcli con mod "${connectionName}" ipv4.method auto`);
				execSync(`nmcli con up "${connectionName}"`);
				result = {
					success: true,
					message: `Сетевой интерфейс ${iface} переведен в режим DHCP`,
				};
				return resolve(result);
			}

			// Включить статический режим для интерфейса
			if (!ip || !mask || !gateway || !dns) {
				throw new Error(
					'IP, маска, шлюз и DNS обязательны для статического режима'
				);
			}
			// Преобразуем маску в CIDR
			function maskToCidr(mask) {
				return mask
					.split('.')
					.map(Number)
					.map((octet) => octet.toString(2))
					.map((bin) => bin.split('1').length - 1)
					.reduce((a, b) => a + b, 0);
			}

			const cidr = maskToCidr(mask);
			console.log('step 1: manager', ip, mask, gateway, dns, cidr);
			execSync(
				`nmcli con mod "${connectionName}" ipv4.addresses ${ip}/${cidr}`
			);
			console.log('step 2: manager', ip, mask, gateway, dns, cidr);
			execSync(
				`nmcli con mod "${connectionName}" ipv4.gateway ${
					gateway || ''
				}`
			);
			console.log('step 3: manager', ip, mask, gateway, dns, cidr);
			execSync(`nmcli con mod "${connectionName}" ipv4.dns "${dns}"`);
			console.log('step 4: manager', ip, mask, gateway, dns, cidr);
			execSync(`nmcli con mod "${connectionName}" ipv4.method manual`);
			console.log('step 5: manager', ip, mask, gateway, dns, cidr);
			execSync(`nmcli con up "${connectionName}"`);
			console.log('step 6: manager', ip, mask, gateway, dns, cidr);
			result = {
				success: true,
				message: `Сетевой интерфейс ${iface} переведен в статический режим`,
				ip,
				mask,
				gateway,
				dns,
			};
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
