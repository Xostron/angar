const { loggerEvent } = require('@tool/logger')
const readJson = require('@tool/json').read
const def = require('./def')
const files = ['fan', 'valve', 'sensor', 'section', 'factory', 'building']

/**
 * Логирование действий пользователя: web, mobile
 * @param {*} code код события websocket
 * @param {*} obj данные от клиента
 * @param {*} reobj доп. данные
 * @returns 
 */
function activityLog(code, obj = {}, reobj = {}) {
	const { _id, buildingId, sectionId, fanId } = obj
	const { clientId, name, bldId, secId } = reobj

	// Если нет данных от клиента - выход
	if (!Object.keys(obj).length) return

	readJson(files)
		.then(([fan, valve, sensor, section, factory, building]) => {
			// Рама pc
			const oData = { fan, valve, sensor, section, factory, building }
			// Подготовка данных для лога
			const { title, value, bId, sId, sensId, type, noLog } = def[code] ? def[code](code, obj, reobj, oData) : { noLog:true }
			// Блокировка лога
			if (noLog) return
			loggerEvent['activity']({
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
