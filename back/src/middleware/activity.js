const {mobileLog} = require('../stat/activity')

/**
 * Логирование действий мобильного клиента
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports = function (req, res, next) {
	mobileLog(req)
	next()
}
