const preparing = require('@root/client/state/fn')

function state() {
	return async function (req, res) {
		const o = await preparing()
		console.log(999002, o?.result?.length)
		res.status(200).json(o?.result ?? [])
	}
}

module.exports = state
