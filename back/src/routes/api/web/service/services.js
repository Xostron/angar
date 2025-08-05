const fs = require('fs');
const path = require('path');
const reboot = require('@tool/scripts/reboot');
const update = require('@tool/scripts/update');
const pm2 = require('@tool/scripts/pm2');
const rebuild = require('@tool/scripts/rebuild');
const get_net_info = require('@tool/scripts/get_net_info');
const set_new_ip = require('@tool/scripts/set_new_ip');

function net_info() {
	return async (req, res) => {
		const result = await get_net_info();
		res.json(result);
	};
}

function reload() {
	return async (req, res) => {
		const result = await reboot();
		res.json(result);
	};
}

function upt_soft() {
	return async (req, res) => {
		const result = await update();
		res.json(result);
	};
}

function pm2_cmd() {
	return async (req, res) => {
		const { code } = req.params;
		const result = await pm2(code);
		res.json(result);
	};
}

function set_ip() {
	return async (req, res) => {
		const { ip } = req.body;
		const result = await set_new_ip(ip);
		res.json(result);
	};
}

function build() {
	return async (req, res) => {
		const result = await rebuild();
		res.json(result);
	};
}
module.exports = { reload, upt_soft, pm2_cmd, build, net_info, set_ip };
