const {data} = require('@store')

/**
 * Аварии автоматического режима (темп улицы не подходит и т.д.)
 * rs-триггер (приоритет на сброс)
 * @param {*} buildingId
 * @param {*} sectionId
 * @param {*} automode
 * @param {*} arr {id код аварии, set условие установки аварии, reset условие сброса аварии, msg текст аварии}
 */
function rs(buildingId, automode, arr) {
	data.alarm.auto ??= {}
	data.alarm.auto[buildingId] ??= {}
	data.alarm.auto[buildingId][automode] ??= {}
	if (!arr?.length) return

	const d = data?.alarm?.auto?.[buildingId]?.[automode]

	arr.forEach((o, idx) => {
		let r = null
		if (o.set && !d?.[o.msg.code]) d[o.msg.code] = { id: idx, ...o.msg }
		if (o.reset) delete d[o.msg.code]
	})
}

module.exports = rs
