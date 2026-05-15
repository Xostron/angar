const express = require('express');
const router = express.Router();
const tenta = require('./tenta');
const stat = require('./stat');
const web = require('./web')
const rw = require('./rw')

function api() {
	tenta(router)
	stat(router)
	web(router)
	rw(router)
	return router;
}

module.exports = api;
