const init = require('@root/client/init/fn/index')

console.log(999999, init, test2)
function equipment() {
	return async (req, res, next) => {
		try {
			init()
			// test()
			console.log(99001)
			res.json({ result: new Date() })
		} catch (error) {
			console.log(error)
			res.status(400).json(error)
		}
	}
}

module.exports = equipment

function test2() {
	return 'test1'
}
