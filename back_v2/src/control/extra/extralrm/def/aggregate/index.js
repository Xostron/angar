const { beepA } = require('@tool/beep')

// Аварийные сигналы beep неуправляемого компрессора агрегата
function aggregate(building, section, obj, s, se, m, automode, acc, data) {
	m.cold.aggregate.forEach((doc) => {
		if (doc.aggregate.slave===true) return
		doc.compressorList.forEach((cl) => {
			beepA(doc, cl, cl.beep, obj, building, acc, 66)
		})
	})
}



module.exports = aggregate
