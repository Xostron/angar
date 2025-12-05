const reboot = require('@tool/scripts/reboot');
const update = require('@tool/scripts/update');
const pm2 = require('@tool/scripts/pm2');
const rebuild = require('@tool/scripts/rebuild');
const get_net_info = require('@tool/scripts/get_net_info');
const set_new_ip = require('@tool/scripts/set_new_ip');
const auto_login = require('@tool/scripts/auto_login');
const reload_net = require('@tool/scripts/reload_net');
const network = require('@tool/scripts/network');
const eth = require('@tool/scripts/eth');
const time = require('@tool/scripts/time');
const statistic = require('@tool/scripts/statistic');
const fsp = require('fs').promises;
const { writeConfig } = require('@tool/init');
const { data } = require('@store');

function keyboard() {
	return (req, res) => {
		try {
			const value = req.body?.value;
			if (value === undefined || value == null)
				return res.status(400).json({ txt: 'не передан параметр' });
			data.retain.keyboard = value;
			res.json({ result: 'ok' });
		} catch (error) {
			res.status(400).json({ txt: error.toString() });
		}
	};
}
function statInfo() {
	return (req, res) => {
		statistic
			.info()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ txt: err.toString() }));
	};
}

function statClear() {
	return (req, res) => {
		statistic
			.clear()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ txt: err.toString() }));
	};
}

function net_info() {
	return (req, res) => {
		get_net_info()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ txt: err.toString() }));
	};
}

function reload() {
	return (req, res) => {
		reboot()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function upt_soft() {
	return (req, res) => {
		update()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function pm2_cmd() {
	return (req, res) => {
		const { code } = req.params;
		pm2(code)
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function set_ip() {
	return (req, res) => {
		const { ip } = req.body;
		set_new_ip(ip)
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function build() {
	return (req, res) => {
		rebuild()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function autoLogin() {
	return (req, res) => {
		const { flag } = req.params;
		if (!flag) {
			return res.status(400).json({ error: 'Не передан флаг' });
		}
		auto_login(flag === true || flag === 'true')
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function reload_netmanager() {
	return (req, res) => {
		reload_net()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function wifi_list() {
	return (req, res) => {
		network
			.wifi_list()
			.then((result) => {
				console.log('r', result);
				res.json({ result });
			})
			.catch((err) => {
				console.error('wifi_list error:', err);
				res.status(400).json({ error: err.toString() });
			});
	};
}

function wifi_connect() {
	return (req, res) => {
		const { bssid, ssid, password } = req.body;
		console.log('req.body', req.body);
		if ((!bssid || !ssid) && !password) {
			return res
				.status(400)
				.json({ error: 'SSID and password are required' });
		}
		network
			.wifi_connect(bssid, ssid, password)
			.then((r) => {
				console.log('wifi_connect3', r);
				if (r.success) {
					res.json(r);
				} else {
					res.status(400).json({ error: r.message });
				}
			})
			.catch((err) => {
				console.log('wifi_connect error:', err);
				const errorMessage = err.message || err.toString();
				res.status(400).json({ error: errorMessage });
			});
	};
}

function disconnect_wifi() {
	return (req, res) => {
		network
			.disconnect_wifi()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function eth_info() {
	return (req, res) => {
		eth.info()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function eth_manager() {
	return (req, res) => {
		eth.manager(req.body)
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function file() {
	return async (req, res) => {
		// Получение файла
		const f = req?.files?.file;
		if (!f) return res.status(400).json({ error: 'Нет файла' });
		// Прочитали файл
		const ff = await fsp.readFile(f.tempFilePath, { encoding: 'utf8' });
		if (!ff) return res.status(404).json({ error: 'Файл пуст' });
		// Дисериализуем и сохраняем в root/data
		try {
			const result = JSON.parse(ff);
			if (!result.pc) throw Error('Некорректный файл');
			console.log(
				99010,
				'Конфигурация из файла обработана -> Устанавливаем...'
			);
			writeConfig(result);
			console.log(99011, 'Конфигурация из файла успешно установлена!');
			res.status(200).json({ resilt: 'ok' });
		} catch (error) {
			res.status(409).json({ error: error.toString() });
		}
	};
}

function sync_time() {
	return (req, res) => {
		time.sync()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

function set_time() {
	return (req, res) => {
		time.set(req.body.dt)
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ error: err.toString() }));
	};
}

module.exports = {
	reload,
	upt_soft,
	pm2_cmd,
	build,
	net_info,
	set_ip,
	autoLogin,
	reload_netmanager,
	eth_info,
	eth_manager,
	file,
	wifi_list,
	wifi_connect,
	sync_time,
	set_time,
	disconnect_wifi,
	keyboard,
	statInfo,
	statClear,
};
