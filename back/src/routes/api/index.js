const express = require('express');
const router = express.Router();
const tenta = require('./tenta');
const stat = require('./stat');
const web = require('./web')

function api() {
	tenta(router)
	stat(router)
	web(router)
	return router;
}

module.exports = api;
