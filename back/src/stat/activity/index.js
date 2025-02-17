const { loggerEvent } = require('@tool/logger')
const readJson = require('@tool/json').read
const def = require('./def')
const files = ['fan', 'valve', 'sensor', 'section', 'factory', 'building']

function activityLog(code, obj = {}, reobj = {}, level = 'activity') {
	const { _id, buildingId, sectionId, fanId } = obj
	if (!Object.keys(obj).length) return
	const { clientId, name, bldId, secId } = reobj

	readJson(files)
		.then(([fan, valve, sensor, section, factory, building]) => {
			const oData = { fan, valve, sensor, section, factory, building }
			const { title, value, bId, sId, sensId, type, noLog } = def[code] ? def[code](code, obj, reobj, oData) : { title: `code: ${code}` }
			
			if (noLog) return
			loggerEvent[level]({
				message: {
					clientId,
					name,
					bldId: _id ?? buildingId ?? bldId ?? bId,
					secId: sectionId ?? secId ?? sId,
					id: fanId ?? sensId,
					title,
					value,
					type,
				},
			})
		})
		.catch(console.log)
}

module.exports = activityLog
