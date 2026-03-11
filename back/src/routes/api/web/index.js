const express = require('express')
const test = require('./test')
const auth = require('./auth')
const service = require('./service')
const history = require('./history')
const activity = require('./activity')
const report = require('./report')

function web(router) {
	const webRouter = express.Router() // api/web
	router.use('/web', webRouter)
	auth(webRouter)
	service(webRouter)
	test(webRouter)
	report(webRouter)
	webRouter.use('/history', history)
	webRouter.use('/activity', activity)
}

module.exports = web
