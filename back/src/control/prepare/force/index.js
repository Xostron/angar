const { mech } = require('@tool/command/mech')
const { ctrlV } = require('@tool/command/module_output')
const { arrCtrlDO } = require('@tool/command/module_output')

// Принудительный останов когда склад выключен и секция в авто или выкл
module.exports = function force(obj) {
	const { data, value, retain } = obj
	for (const bld of data.building) {
		// Тип склада холодильник пропускается
		if (bld?.type === 'cold') continue
		// Склад вкл/выкл
		const start = retain?.[bld._id]?.start
		if (start) continue
		// Секции склада в авто
		let section = data.section.filter((s) => s?.buildingId === bld?._id)
		section = section.filter(
			(s) => retain?.[bld._id]?.mode?.[s._id] || retain?.[bld._id]?.mode?.[s._id] === null
		)
		if (!section?.length) continue

		section.forEach((sec) => {
			const m = mech(obj, sec._id, bld._id)
			arrCtrlDO(bld._id, m.fanS, 'off')
			m.vlvS.forEach((el) => ctrlV(el, bld._id, 'close'))
		})
	}
}
