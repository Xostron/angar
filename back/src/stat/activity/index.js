const { loggerEvent } = require('@tool/logger')
const readJson = require('@tool/json').read
const def = require('./def')

function activity(code, obj) {
	if (!def[code]) return
	const { _id, buildingId, sectionId, clientId, cliName, fanId } = obj

	readJson(['fan', 'valve', 'sensor', 'section', 'factory', 'building'])
		.then(([fan, valve, sensor, section, factory, building]) => {
			// Рама pc
			const oData = { fan, valve, sensor, section, factory, building }
			// Подготовка данных для лога
			const { title, value, bId, sId, sensId, type, noLog } = def[code](code, obj, oData)
			// Блокировка лога
			if (noLog) return
			loggerEvent['activity']({
				message: {
					clientId,
					name: cliName,
					bldId: _id ?? buildingId ?? bId,
					secId: sectionId ?? sId,
					id: fanId ?? sensId,
					title,
					value,
					type,
				},
			})
		})
		.catch(console.log)
}

/**
 * Логирование действий пользователя: web
 * @param {*} code код события websocket
 * @param {*} obj данные от клиента
 * @returns
 */
function webLog(code, obj = {}) {
	// Если нет данных от клиента - выход
	if (!Object.keys(obj).length || !code) return
	activity(code, obj)
}

/**
 * Логирование действий пользователя: mobile
 * @param {*} req
 * @returns
 */
function mobileLog(req) {
	const code = req.headers?.code
	console.log(111, code, req.body)
	if (!def[code]) return
	const obj = {
		val: req.body?.value,
		buildingId: req.body?.buildingId,
		cliName: req.headers?.cliname,
		clientId: req.headers?.clientid,
	}
	activity(code, obj)
}

module.exports = { webLog, mobileLog }
