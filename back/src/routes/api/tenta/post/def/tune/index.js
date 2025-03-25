const { setTune } = require('@tool/command/set')

function cmd(obj) {
	return new Promise((resolve, reject) => {
		const { valve, stage, buildingId } = obj
		const o = {
			[valve._id]: { ...valve, _stage: stage, _build: buildingId },
		}
		setTune(o)
		resolve(true)
	})
}

/**
  {
	"valve":{
		"sectionId": ["65d4aee3b47bb93c40100fd6"],
		"_id": "65d6f8756109ee21ac4ce8ea",
		"type": "in",
		"module": {
			"off": {
				"channel": 1,
				"id": "65d4b0efb47bb93c40100fe9"
			},
			"on": {
				"channel": 2,
				"id": "65d4b0efb47bb93c40100fe9"
			}
		},
		"kp": 0.7
  	},
	"stage":"begin",
	"buildingId":"65d4aed4b47bb93c40100fd5"
	}
 */

module.exports = cmd
