const fs = require('fs')
const path = require('path')
const reboot = require('@tool/scripts/reboot')
const update = require('@tool/scripts/update')
const pm2 = require('@tool/scripts/pm2')
const rebuild = require('@tool/scripts/rebuild')
const get_net_info = require('@tool/scripts/get_net_info')
const set_new_ip = require('@tool/scripts/set_new_ip')
const auto_login = require('@tool/scripts/auto_login')
const reload_net = require('@tool/scripts/reload_net')
const wifi = require('@tool/scripts/wifi')
const eth = require('@tool/scripts/eth')

function net_info() {
	return (req, res) => {
		get_net_info()
			.then((r) => res.json(r))
			.catch((err) => res.status(400).json({ txt: err.toString() }))
	}
}

function reload() {
	return async (req, res) => {
		const result = await reboot()
		res.json(result)
	}
}

function upt_soft() {
	return async (req, res) => {
		const result = await update()
		res.json(result)
	}
}

function pm2_cmd() {
	return async (req, res) => {
		const { code } = req.params
		const result = await pm2(code)
		res.json(result)
	}
}

function set_ip() {
	return async (req, res) => {
		const { ip } = req.body
		const result = await set_new_ip(ip)
		res.json(result)
	}
}

function build() {
	return async (req, res) => {
		const result = await rebuild()
		res.json(result)
	}
}

function autoLogin() {
	return async (req, res) => {
		const { flag } = req.params

		const result = await auto_login(flag === true || flag === 'true')
		res.json(result)
	}
}

function reload_netmanager() {
	return async (req, res) => {
		const result = await reload_net()
		res.json(result)
	}
}

function wifi_info() {
	return async (req, res) => {
		const result = await wifi.info()
		res.json(result)
	}
}

function wifi_manager() {
	return async (req, res) => {
		const result = await wifi.manager(req.body)
		res.json(result)
	}
}

function eth_info() {
	return async (req, res) => {
		const result = await eth.info()
		res.json(result)
	}
}

function eth_manager() {
	return async (req, res) => {
		const result = await eth.manager(req.body)
		res.json(result)
	}
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
	wifi_info,
	wifi_manager,
	eth_info,
	eth_manager,
}
