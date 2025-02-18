const mes = require('@dict/message')
const { conv } = require('@tool/conv')

module.exports = {
	// Пуск склада
	s_start: (code, obj, reobj, oData) => ({ title: obj.val ? mes[500].msg : mes[501].msg, value: obj.val, type: code }),
	// Смена авторежима
	s_auto_mode: (code, obj, reobj, oData) => ({ title: mes[502].msg + ` (${conv('automode', obj.val, 0)})`, value: obj.val, type: code }),
	// Смена продукта
	s_product: (code, obj, reobj, oData) => ({ title: mes[503].msg + ` (${obj.name})`, value: obj.code, type: code }),
	// Управление вентилятором
	s_fan: (code, obj, reobj, oData) => {
		const { fan } = oData
		const f = fan.find((el) => el._id == obj.fanId)
		if (obj.action === 'run') return { title: mes[510](f.name), value: obj.action, type: code }
		if (obj.action === 'stop') return { title: mes[511](f.name), value: obj.action, type: code }
		if (obj.action === 'off') return { title: obj.value ? mes[512](f.name) : mes[513](f.name), value: obj.value ? 'off' : 'on', type: code }
		return { title: `obj.action ${obj.action}` }
	},
	// Смена режимов секции
	s_mode: (code, obj, reobj, oData) => {
		const { section } = oData
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
			type: code,
		}
	},
	// Настройки датчиков
	s_sens: (code, obj, reobj, oData) => {
		const { sensor } = oData
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
			type: code,
		}
	},
	// Настройки авторежимов
	s_setting_au: (code, obj, reobj, oData) => {
		const { factory } = oData
		stgCode = obj.code
		prdCode = obj.prdCode
		nameStg = factory?.[stgCode]?._name
		namePrd = factory?.[stgCode]?.[prdCode]?._name
		let title = []
		// По линии
		for (const line in obj.value) {
			const lineName = factory?.[stgCode]?.[prdCode]?.[line]?._name
			// По полю (mark)
			for (const fld in obj.value[line]) {
				const fldVal = obj.value[line][fld]
				const fldName = line === fld ? '' : `(${factory?.[stgCode]?.[prdCode]?.[line]?.[fld]?._name}) `
				title.push(`${lineName} ${fldName}= ${fldVal}`)
			}
		}

		return {
			type: code,
			title: `Изменение настройки \"${nameStg}\", продукт \"${namePrd}\": ` + (title.length > 1 ? title.join('; ') : title.join('')),
		}
	},
	s_reset: (code, obj, reobj, oData) => {
		const { building } = oData
		const bId = obj?.buildingId
		const bld = building.find((el) => el._id == bId)
		// console.log(111, { bId, type: 'reset', title: `${bld.name} ${bld.code}: Сброс аварии` })
		return { bId, type: code, title: `${bld.name} ${bld.code}: Сброс аварии` }
	},
	// Калибровка клапанов
	s_tune: (code, obj, reobj, oData) => {
		const { section, building } = oData
		let title, bId
		for (const vId in obj) {
			if (title) continue
			const v = obj[vId]
			if (!v?._stage) continue
			const sect = section.find((el) => v.sectionId.includes(el._id))
			if (!sect) continue
			const bld = building.find((el) => el._id == sect.buildingId)
			if (!bld) continue
			bId = bld._id
			title = `${bld.name} ${bld.code}: Калибровка клапанов`
		}
		return title ? { bId, title, type: code } : { noLog: true }
	},
	s_warming: (code, obj, reobj, oData) => {
		const { buildingId, sectionId, cmd } = obj
		const { section, building } = oData
		const bld = building.find((el) => el._id == buildingId)
		const sec = section.find((el) => el._id == sectionId)
		const title = cmd
			? `${bld.name} ${bld.code}. ${sec.name}: Прогрев клапанов включен`
			: `${bld.name} ${bld.code}. ${sec.name}: Прогрев клапанов выключен`
		return { bId: bld._id, sId: sec._id, type: code, title, value: cmd }
	},
	s_output: (code, obj, reobj, oData) => {
		const { valve, building, section } = oData
		const { type, sel, vlvId, setpoint } = obj
		if (type !== 'valve') return {}
		let bld, sec, vlv

		for (const key in obj) {
			if (['type', 'sel', 'vlvId', 'setpoint'].includes(key)) continue
			bld = building.find((el) => el._id == key)
			if (!bld) continue
			vlv = valve.find((el) => el._id == vlvId)
			if (!vlv) continue
			sec = section.find((el) => vlv.sectionId.includes(el._id))
			if (!sec) continue
		}

		if (!bld || !sec || !vlv) return { noLog: true }
		let title = `${bld.name} ${bld.code}. ${sec.name}. ${vlv.type == 'in' ? 'Приточный клапан: ' : 'Выпускной клапан: '}`
		if (sel == 'stop') title += 'ручное управление - Стоп'
		if (sel == 'iopn') title += 'ручное управление - Открыть'
		if (sel == 'icls') title += 'ручное управление - Закрыть'
		if (sel == 'popn') title += `ручное управление - Открыть на ${setpoint}%`

		return { bId: bld._id, sId: sec._id, type: code, title, value: sel }
	},
}
