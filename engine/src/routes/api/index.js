const express = require('express');
const router = express.Router();
const tenta = require('./tenta');
const stat = require('./stat');
const web = require('./web')
const plcIo = require('./plc_io')

function api() {
	tenta(router)
	stat(router)
	web(router)
	plcIo(router)
	return router;
}

module.exports = api;
