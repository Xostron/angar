const express = require('express')
const test = require('./test')
const auth = require('./auth')
const service = require('./service')

function web(router) {
	const webRouter = express.Router() // api/web
	router.use('/web', webRouter)
	auth(webRouter)
	service(webRouter)
	test(webRouter)
}

module.exports = web
