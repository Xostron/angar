const { loggerEvent } = require('@tool/logger')
const mes = require('@dict/message')
const { conv } = require('@tool/conv')
const readJson = require('@tool/json').read
const files = ['fan', 'valve', 'sensor', 'section', 'factory']

function activityLog(code, obj = {}, reobj = {}, level = 'activity') {
	const { _id, buildingId, sectionId, fanId } = obj
	if (!Object.keys(obj).length) return
	const { clientId, name, bldId, secId } = reobj
	readJson(files)
		.then(([fan, valve, sensor, section, factory]) => {
			const r = { fan, valve, sensor, section, factory }
			const { title, value, bId, sId, sensId, type } = oMessage(code, obj, reobj, r)
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

function oMessage(code, obj, reobj, oData) {
	const { fan, valve, sensor, section, factory } = oData
	switch (code) {
		case 's_start':
			return { title: obj.val ? mes[500].msg : mes[501].msg, value: obj.val, type: 'start' }
		case 's_auto_mode':
			return { title: mes[502].msg + ` (${conv('automode', obj.val, 0)})`, value: obj.val, type: 'automode' }
		case 's_product':
			return { title: mes[503].msg + ` (${obj.name})`, value: obj.code, type: 'product' }
		case 's_fan':
			const f = fan.find((el) => el._id == obj.fanId)
			if (obj.action === 'run') return { title: mes[510](f.name), value: obj.action, type: 'fan' }
			if (obj.action === 'stop') return { title: mes[511](f.name), value: obj.action, type: 'fan' }
			if (obj.action === 'off') return { title: obj.value ? mes[512](f.name) : mes[513](f.name), value: obj.value ? 'off' : 'on', type: 'fan' }
			return { title: `obj.action ${obj.action}` }
		case 's_mode': {
			const bId = Object.keys(obj)[0]
			const sId = Object.keys(obj[bId])[0]
			const value = obj[bId][sId]
			const s = section.find((el) => el._id == sId)
			return {
				title:
					value === null
						? mes[518](s.name, 'выключена')
						: value === true
						? mes[518](s.name, 'в автоматическом режиме')
						: mes[518](s.name, 'в ручном режиме'),
				value,
				bId,
				sId,
				type: 'mode',
			}
		}
		case 's_sens': {
			const bId = Object.keys(obj)[0]
			let title = []
			for (const sensId in obj[bId]) {
				const sens = sensor.find((el) => el._id === sensId)
				const on = obj[bId][sensId].on
				const corr = obj[bId][sensId].corr

				if (on === true) {
					if (corr) title.push(`${sens.name} введен в работу, коррекция = ${corr}`)
					else title.push(`${sens.name} введен в работу`)
				}
				if (on === false) {
					if (corr) title.push(`${sens.name} выведен из работы, коррекция = ${corr}`)
					else title.push(`${sens.name} выведен из работы`)
				}
				if (on === undefined) {
					if (corr) title.push(`${sens.name}: коррекция = ${corr}`)
				}
			}
			return {
				title: title.length > 1 ? title.join('; ') : title.join(),
				bId,
				// sensId,
				type: 'sens',
			}
		}
		case 's_setting_au': {
			stgCode = obj.code
			prdCode = obj.prdCode

			nameStg = factory?.[stgCode]?._name
			namePrd = factory?.[stgCode]?.[prdCode]?._name
			let title = []
			for (const line in obj.value) {
				const lineName = factory?.[stgCode]?.[prdCode]?.[line]?._name
				for (const fld in obj.value[line]) {
					const fldVal = obj.value[line][fld]
					const fldName = line === fld ? '' : `(${factory?.[stgCode]?.[prdCode]?.[line]?.[fld]?._name}) `
					title.push(`${lineName} ${fldName}= ${fldVal}`)
				}
			}

			return {
				type: 'setting',
				title: `Изменение настройки \"${nameStg}\", продукт \"${namePrd}\": ` + (title.length > 1 ? title.join('; ') : title.join('')),
			}
		}

		default:
			return { title: `code: ${code}` }
	}
}

module.exports = activityLog
