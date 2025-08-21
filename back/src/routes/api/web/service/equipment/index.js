const init = require('@tool/init')

function equip() {
    return async (req, res, next) => {
		console.log('\n\nequipment')
        try {
            await init()
			res.json({ result: new Date() })
		} catch (error) {
			console.log(error)
			res.status(400).json(error)
		}
	}
}

module.exports = equip


