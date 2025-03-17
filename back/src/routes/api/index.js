const express = require('express')
const router = express.Router()
const test = require('./test')
const auth = require('./auth')
const live = require('./live')
const tenta = require('./tenta')
const stat = require('./stat')

function api() {
	auth(router)
	test(router)
	live(router)
	tenta(router)
	stat(router)
	return router
}

module.exports = api
