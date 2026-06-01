const def = require('./def')

/**
 * Обработка авари микросервиса
 */
async function extralrm() {
	try {
		for (const key in def) await def[key]()

	} catch (error) {
		console.log(error)
	}
}

module.exports = extralrm
