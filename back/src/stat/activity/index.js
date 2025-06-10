const { loggerEvent } = require('@tool/logger')
const readJson = require('@tool/json').read
const def = require('./def')
const path = require('path')


/**
 * Логирование действий пользователя: web
 * @param {*} code код события websocket
 * @param {*} o данные от клиента
 * @returns
 */
function webLog(code, o) {
	// Если нет данных от клиента - выход
	o = o ?? {}
	console.log(5551, o)
	if (!Object.keys(o)?.length || !code) return
	activity(code, o)
}

/**
 * Логирование действий пользователя: mobile
 * @param {*} req
 * @returns
 */
function mobileLog(req) {
	const code = req.headers?.code
	if (!def[code]) return
	const o = {
		val: req.body?.value,
		buildingId: req.body?.buildingId,
		sectionId: req.body?.sectionId,
		fanId: req.body?.fanId,
		cliName: req.headers?.cliname,
		clientId: req.headers?.clientid,
		obj: req.body?.obj,
		code: req.body?.code,
		product: req.body?.product,
		vlvId: req.body?.valveId,
		setpoint: req.body?.sp,
	}
	activity(code, o)
}


function activity(code, o) {
	if (!def[code]) return
	const { _id, buildingId, sectionId, clientId, cliName, fanId } = o
	const _retain = path.join('retain', 'data.json')
	readJson(['fan', 'valve', 'sensor', 'section', 'factory', 'building', _retain])
		.then(([fan, valve, sensor, section, factory, building, retain]) => {
			// Рама pc
			const oData = { fan, valve, sensor, section, factory, building, retain }
			// Подготовка данных для лога
			const { title, value, bId, sId, sensId, type, noLog } = def[code](code, o, oData)
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

module.exports = { webLog, mobileLog }
